use aiken/hash.{Blake2b_224, Hash}
use aiken/list
use aiken/transaction.{ScriptContext, Spend, Transaction}
use aiken/transaction/credential.{VerificationKey}

validator(owner: Hash<Blake2b_224, VerificationKey>) {
  fn public_micro_drive(
    _datum: Void,
    _redeemer: Void,
    context: ScriptContext,
  ) -> Bool {
    when context.purpose is {
      Spend(_) -> signed_by_owner(context.transaction, owner)
      _ -> False
    }
  }
}

fn signed_by_owner(transaction: Transaction, vk: VerificationKey) {
  list.has(transaction.extra_signatories, vk)
}
