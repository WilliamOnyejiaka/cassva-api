import { Transaction } from "../namespaces";
import { Transaction as handler } from "./../handlers";

const transaction = new Transaction();

transaction.onConnection(handler.onConnection.bind(handler));
transaction.register('createResource', handler.createResource.bind(handler));
transaction.register('massCrud', handler.massCrud.bind(handler));

export default transaction;