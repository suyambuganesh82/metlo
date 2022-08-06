import { AlertType, ConnectionType, RestMethod, RiskScore } from "./enums";

export interface Meta {
  incoming: boolean;
  source: string;
  sourcePort: string;
  destination: string;
  destinationPort: string;
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
  host?: string;
  riskScore?: RiskScore;
  offset?: number;
  limit?: number;
}

export type JSONValue =
  | string
  | number
  | boolean
  | { [x: string]: JSONValue }
  | Array<JSONValue>;

export interface ApiTrace {
  uuid: string;
  path: string;
  createdAt: Date;
  host: string;
  method: RestMethod;
  requestParameters: PairObject[];
  requestHeaders: PairObject[];
  requestBody: string;
  responseStatus: number;
  responseHeaders: PairObject[];
  responseBody: string;
  meta: Meta;
  apiEndpointUuid: string;
}

export interface Alert {
  apiEndpointUuid?: string;
  endpoint?: Endpoint;
  createdAt: Date;
  type: AlertType;
  risk: RiskScore;
  description: string;
}

export interface PIIField {
  dataType: string;
  dataPath: string;
  risk: RiskScore;
  dateIdentified: string;
}

export interface Endpoint {
  uuid: string;
  host: string;
  path: string;
  method: string;
  riskScore: RiskScore;
  firstDetected: string;
  lastActive: string;
  piiData: PIIField[];
  traces: ApiTrace[];
  alerts: Alert[];
}

export interface Connection {
  createdAt: Date;
  uuid: string;
  name: string;
  type: ConnectionType;
}
