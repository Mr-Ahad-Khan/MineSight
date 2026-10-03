const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { kmeans } = require('ml-kmeans');
const { protect } = require('../middleware/auth');

const router = express.Router();
const datasetPath = path.resolve(
  __dirname,
  '../../dataset/Mines_and_Mineral_Resources.csv',
);

let rowsPromise;
let spatialAnalysisPromise;

const loadRows = () => {
  if (!rowsPromise) {
    rowsPromise = fs
      .readFile(datasetPath, 'utf8')
      .then((content) =>
        parse(content, {
          bom: true,
          columns: true,
          skip_empty_lines: true,
          trim: true,
        }),
      );
  }

  return rowsPromise;
};

const countBy = (rows, field, name) => {
  const counts = new Map();

  rows.forEach((row) => {
    const value = row[field]?.trim();
    if (value) counts.set(value, (counts.get(value) || 0) + 1);
  });

  return Array.from(counts, ([value, count]) => ({ [name]: value, count }))
    .sort((left, right) => right.count - left.count || left[name].localeCompare(right[name]));
};

const getSpatialClusters = (rows) => {
  if (!spatialAnalysisPromise) {
    spatialAnalysisPromise = Promise.resolve().then(() => {
      const points = rows.map((row) => ({
        row,
        coordinates: [Number(row.X), Number(row.Y)],
      })).filter(({ coordinates }) => coordinates.every(Number.isFinite));

      if (points.length < 5) {
        throw new Error('At least five valid coordinate records are required for clustering');
      }

      const clusterCount = 5;
      const fittedModel = kmeans(
        points.map(({ coordinates }) => coordinates),
        clusterCount,
        { initialization: 'kmeans++', maxIterations: 100, seed: 42 },
      );
      const clusters = Array.from({ length: clusterCount }, (_, index) => ({
        id: index + 1,
        center: {
          longitude: fittedModel.centroids[index][0],
          latitude: fittedModel.centroids[index][1],
        },
        sites: [],
        stateCounts: new Map(),
        industryCounts: new Map(),
      }));

      points.forEach(({ row, coordinates }, index) => {
        const cluster = clusters[fittedModel.clusters[index]];
        cluster.sites.push({
          longitude: coordinates[0],
          latitude: coordinates[1],
          state: row.STATE,
          industry: row.NAICSDESCR,
        });
        if (row.STATE) {
          cluster.stateCounts.set(row.STATE, (cluster.stateCounts.get(row.STATE) || 0) + 1);
        }
        if (row.NAICSDESCR) {
          cluster.industryCounts.set(
            row.NAICSDESCR,
            (cluster.industryCounts.get(row.NAICSDESCR) || 0) + 1,
          );
        }
      });

      const mostCommon = (counts) =>
        [...counts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] || 'Unknown';

      return clusters.map((cluster) => ({
        id: cluster.id,
        siteCount: cluster.sites.length,
        center: cluster.center,
        dominantState: mostCommon(cluster.stateCounts),
        dominantIndustry: mostCommon(cluster.industryCounts),
        sites: cluster.sites,
      }));
    });
  }

  return spatialAnalysisPromise;
};

router.get('/', protect, async (req, res, next) => {
  try {
    const rows = await loadRows();
    const spatialClusters = await getSpatialClusters(rows);

    res.json({
      success: true,
      data: {
        totalRecords: rows.length,
        columns: Object.keys(rows[0] || {}),
        states: countBy(rows, 'STATE', 'state'),
        industryClasses: countBy(rows, 'NAICSDESCR', 'name'),
        spatialClusters,
      },
    });
  } catch (error) {
    rowsPromise = null;
    spatialAnalysisPromise = null;
    next(error);
  }
});

router.get('/records', protect, async (req, res, next) => {
  try {
    const rows = await loadRows();
    const requestedPage = Number.parseInt(req.query.page, 10);
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const limit = Number.isInteger(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 100)
      : 25;
    const search = String(req.query.search || '').trim().toLowerCase().slice(0, 100);
    const filteredRows = search
      ? rows.filter((row) =>
          Object.values(row).some((value) =>
            String(value ?? "")
              .toLowerCase()
              .includes(search),
          ),
        )
      : rows;
    const totalRecords = filteredRows.length;
    const totalPages = Math.ceil(totalRecords / limit);

    res.json({
      success: true,
      data: {
        columns: Object.keys(rows[0] || {}),
        records: filteredRows.slice((page - 1) * limit, page * limit),
        pagination: { page, limit, totalRecords, totalPages },
      },
    });
  } catch (error) {
    rowsPromise = null;
    spatialAnalysisPromise = null;
    next(error);
  }
});

module.exports = router;