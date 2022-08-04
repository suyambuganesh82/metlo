import { AlertType, RestMethod, RiskScore } from "./enums";

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
  environment: string;
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