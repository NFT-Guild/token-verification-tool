use aiken/hash.{Blake2b_224, Hash}
use aiken/list
use aiken/transaction.{ScriptContext, Transaction}
use aiken/transaction/credential.{VerificationKey}

validator(owner: Hash<Blake2b_224, VerificationKey>) {
  fn owner_can_mint(_redeemer: Void, context: ScriptContext) -> Bool {
    signed_by_owner(context.transaction, owner)
  }
}

fn signed_by_owner(transaction: Transaction, vk: VerificationKey) {
  list.has(transaction.extra_signatories, vk)
}
