import { RestMethod } from "./enums";

export interface Meta {
  incoming: boolean;
  source: string;
  sourcePort: string;
  destination: string;
  destinationPort: string;
  environment: string;
}

export interface PairObject {
  name: string;
  value: string;
}

export interface Url {
  host: string;
  path: string;
  parameters: PairObject[];
}

export interface Request {
  url: Url;
  headers: PairObject[];
  body: string;
  method: RestMethod;
}

export interface Response {
  status: number;
  headers: PairObject[];
  body: string;
}

export interface TraceParams {
  request: Request;
  response: Response;
  meta: Meta;
}

export interface GetEndpointParams {
  environment?: string;
  host?: string;
  riskScore?: string;
  offset?: number;
  limit?: number;
}

export type JSONValue =
  | string
  | number
  | boolean
  | { [x: string]: JSONValue }
  | Array<JSONValue>;