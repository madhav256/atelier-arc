import mongoose from 'mongoose';

let supportsTransactions;

async function detect() {
  if (supportsTransactions !== undefined) return supportsTransactions;
  try {
    const hello = await mongoose.connection.db.admin().command({ hello: 1 });
    supportsTransactions = Boolean(hello.setName || hello.msg === 'isdbgrid');
  } catch {
    supportsTransactions = false;
  }
  return supportsTransactions;
}

// Runs fn inside a Mongo transaction when the deployment supports it (replica set / Atlas).
// On a standalone dev server fn runs without a session; callers use conditional atomic
// updates and compensation so correctness does not depend on the transaction alone.
export async function withTransaction(fn) {
  if (!(await detect())) return fn(null);
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
}

export const resetTransactionSupport = () => {
  supportsTransactions = undefined;
};
