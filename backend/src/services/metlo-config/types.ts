export interface HostMapping {
  host: string
  pattern: string
}

export interface HostMappingCompiled {
  host: string
  pattern: RegExp
}

export interface MetloConfigType {
  globalFullTraceCapture?: boolean
  minAnalyzeTraces?: number
  hostMap?: HostMapping[]
  customWords?: string[]
}