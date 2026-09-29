const crypto = require('crypto');
const AuditLog = require('../models/AuditLog');

const GENESIS_HASH = 'GENESIS';
let writeQueue = Promise.resolve();

const normalize = (value) => {
  if (value instanceof Date) return value.toISOString();
  if (value && typeof value.toHexString === 'function') return value.toHexString();
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        result[key] = normalize(value[key]);
        return result;
      }, {});
  }
  return value;
};

const getBlockPayload = (block) => ({
  sequence: block.sequence,
  previousHash: block.previousHash,
  blockTimestamp: new Date(block.blockTimestamp).toISOString(),
  userId: block.userId ? String(block.userId) : null,
  action: block.action,
  entityType: block.entityType,
  entityId: block.entityId ? String(block.entityId) : null,
  oldValue: block.oldValue ?? null,
  newValue: block.newValue ?? null,
  ip: block.ip || null,
});

const hashPayload = (payload) =>
  crypto.createHash('sha256').update(JSON.stringify(normalize(payload))).digest('hex');

const appendAuditBlock = (entry) => {
  const write = writeQueue.then(async () => {
    const previousBlock = await AuditLog.findOne({ sequence: { $exists: true } })
      .sort({ sequence: -1 })
      .lean();
    const blockTimestamp = new Date();
    const block = {
      ...entry,
      sequence: (previousBlock?.sequence || 0) + 1,
      previousHash: previousBlock?.blockHash || GENESIS_HASH,
      blockTimestamp,
    };

    block.blockHash = hashPayload(getBlockPayload(block));
    return AuditLog.create(block);
  });

  writeQueue = write.catch(() => undefined);
  return write;
};

const verifyAuditChain = async () => {
  const blocks = await AuditLog.find({ sequence: { $exists: true } })
    .sort({ sequence: 1 })
    .lean();
  let expectedPreviousHash = GENESIS_HASH;

  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    const expectedSequence = index + 1;
    if (
      block.sequence !== expectedSequence ||
      block.previousHash !== expectedPreviousHash ||
      hashPayload(getBlockPayload(block)) !== block.blockHash
    ) {
      return {
        valid: false,
        checkedBlocks: index,
        brokenAt: block.sequence,
      };
    }
    expectedPreviousHash = block.blockHash;
  }

  return { valid: true, checkedBlocks: blocks.length, brokenAt: null };
};

module.exports = { appendAuditBlock, verifyAuditChain };