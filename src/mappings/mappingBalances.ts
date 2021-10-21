import { SubstrateExtrinsic, SubstrateEvent, SubstrateBlock } from "@subql/types";
import { BalancesTransfer } from "../types";
import { Balance } from "@polkadot/types/interfaces";

const MultiSignedAccount = [
  { address: "126TwBzBM4jUEK2gTphmW4oLoBWWnYvPp8hygmduTr4uds57", para_id: 2050 },
  { address: "16D2eVuK5SWfwvtFD3gVdBC2nc2BafK31BY6PrbZHBAGew7L", para_id: 2070 },
  { address: "1egYCubF1U5CGWiXjQnsXduiJYP49KTs8eX1jn1JrTqCYyQ", para_id: 2090 },
]

export async function handleBalancesTransfer(event: SubstrateEvent): Promise<void> {
  const blockNumber = event.block.block.header.number.toNumber();

  const { event: { data: [from, to, balance] } } = event;
  const account = MultiSignedAccount.find(vendor => vendor.address === to.toString());
  if (account !== undefined) {
    const record = new BalancesTransfer(blockNumber.toString() + '-' + event.idx.toString());
    record.block_height = blockNumber;
    record.event_id = event.idx;
    record.extrinsic_id = event.extrinsic ? event.extrinsic.idx : null;
    record.block_timestamp = event.block.timestamp;
    record.from = from.toString();
    record.to = to.toString();
    record.balance = (balance as Balance).toBigInt();
    record.para_id = account.para_id;
    await record.save();
  }
}

