import PouchDB from "pouchdb-browser";
import * as Keychain from 'react-native-keychain';

import { getPreference, setPreference } from "./preferences";

export interface Credentials {
  address: string;
  username: string;
  password: string;
  e2e: bool;
  e2e_key: string;
}

export const getCredentials = async (): Promise<Credentials> => {
  return {
    address: await getPreference("remote_address"),
    username: await getInternetCredentials(address).username,
    password: await getInternetCredentials(address).password,
    e2e: await getPreference("e2e"),
		e2e_key: (e2e) ? await getInternetCredentials("memoria.e2e.key").password : "",
  };
};

export const setCredentials = (credentials: Credentials) => {
  setPreference("remote_address", credentials.address);
	setPreference("e2e", credentials.e2e);
  (async() => {
		await setInternetCredentials(credentials.address, credentials.username, credentials.password);
		await setInternetCredentials("memoria.e2e.key", "", credentials.e2e_key);
	})();
};

export const syncDatabase = async (
  database: any,
  credentials: Credentials,
  options: PouchDB.Replication.SyncOptions,
): Promise<void> => {
  return new Promise((resolve: Function, reject: Function) => {
    const remote = new PouchDB(credentials.address, {
      skip_setup: true,
      auth: {
        username: credentials.username,
        password: credentials.password,
      },
    });

    database
      .sync(remote, options)
      .then(resolve)
      .catch((error: any) => reject(error));
  });
};
