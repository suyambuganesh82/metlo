# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: metloingest.proto
"""Generated protocol buffer code."""
from google.protobuf.internal import builder as _builder
from google.protobuf import descriptor as _descriptor
from google.protobuf import descriptor_pool as _descriptor_pool
from google.protobuf import symbol_database as _symbol_database
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()




DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n\x11metloingest.proto\x12\x0bmetloingest\"%\n\x06KeyVal\x12\x0c\n\x04name\x18\x01 \x01(\t\x12\r\n\x05value\x18\x02 \x01(\t\"M\n\x06\x41piUrl\x12\x0c\n\x04host\x18\x01 \x01(\t\x12\x0c\n\x04path\x18\x02 \x01(\t\x12\'\n\nparameters\x18\x03 \x03(\x0b\x32\x13.metloingest.KeyVal\"r\n\nApiRequest\x12\x0e\n\x06method\x18\x01 \x01(\t\x12 \n\x03url\x18\x02 \x01(\x0b\x32\x13.metloingest.ApiUrl\x12$\n\x07headers\x18\x03 \x03(\x0b\x32\x13.metloingest.KeyVal\x12\x0c\n\x04\x62ody\x18\x04 \x01(\t\"Q\n\x0b\x41piResponse\x12\x0e\n\x06status\x18\x01 \x01(\x05\x12$\n\x07headers\x18\x02 \x03(\x0b\x32\x13.metloingest.KeyVal\x12\x0c\n\x04\x62ody\x18\x03 \x01(\t\"\x84\x01\n\x07\x41piMeta\x12\x13\n\x0b\x65nvironment\x18\x01 \x01(\t\x12\x10\n\x08incoming\x18\x02 \x01(\x08\x12\x0e\n\x06source\x18\x03 \x01(\t\x12\x13\n\x0bsource_port\x18\x04 \x01(\x05\x12\x13\n\x0b\x64\x65stination\x18\x05 \x01(\t\x12\x18\n\x10\x64\x65stination_port\x18\x06 \x01(\x05\"\x84\x01\n\x08\x41piTrace\x12(\n\x07request\x18\x01 \x01(\x0b\x32\x17.metloingest.ApiRequest\x12*\n\x08response\x18\x02 \x01(\x0b\x32\x18.metloingest.ApiResponse\x12\"\n\x04meta\x18\x03 \x01(\x0b\x32\x14.metloingest.ApiMeta\"$\n\x0eRepeatedString\x12\x12\n\nrep_string\x18\x01 \x03(\t\",\n\x07SqliRes\x12\x0c\n\x04\x64\x61ta\x18\x01 \x01(\t\x12\x13\n\x0b\x66ingerprint\x18\x02 \x01(\t\"\xd2\x06\n\x0fProcessTraceRes\x12\r\n\x05\x62lock\x18\x01 \x01(\x08\x12\x43\n\x0cxss_detected\x18\x02 \x03(\x0b\x32-.metloingest.ProcessTraceRes.XssDetectedEntry\x12\x45\n\rsqli_detected\x18\x03 \x03(\x0b\x32..metloingest.ProcessTraceRes.SqliDetectedEntry\x12X\n\x17sensitive_data_detected\x18\x04 \x03(\x0b\x32\x37.metloingest.ProcessTraceRes.SensitiveDataDetectedEntry\x12?\n\ndata_types\x18\x05 \x03(\x0b\x32+.metloingest.ProcessTraceRes.DataTypesEntry\x12M\n\x11validation_errors\x18\x06 \x03(\x0b\x32\x32.metloingest.ProcessTraceRes.ValidationErrorsEntry\x12\x1c\n\x14request_content_type\x18\x07 \x01(\t\x12\x1d\n\x15response_content_type\x18\x08 \x01(\t\x1a\x32\n\x10XssDetectedEntry\x12\x0b\n\x03key\x18\x01 \x01(\t\x12\r\n\x05value\x18\x02 \x01(\t:\x02\x38\x01\x1aI\n\x11SqliDetectedEntry\x12\x0b\n\x03key\x18\x01 \x01(\t\x12#\n\x05value\x18\x02 \x01(\x0b\x32\x14.metloingest.SqliRes:\x02\x38\x01\x1aY\n\x1aSensitiveDataDetectedEntry\x12\x0b\n\x03key\x18\x01 \x01(\t\x12*\n\x05value\x18\x02 \x01(\x0b\x32\x1b.metloingest.RepeatedString:\x02\x38\x01\x1aM\n\x0e\x44\x61taTypesEntry\x12\x0b\n\x03key\x18\x01 \x01(\t\x12*\n\x05value\x18\x02 \x01(\x0b\x32\x1b.metloingest.RepeatedString:\x02\x38\x01\x1aT\n\x15ValidationErrorsEntry\x12\x0b\n\x03key\x18\x01 \x01(\t\x12*\n\x05value\x18\x02 \x01(\x0b\x32\x1b.metloingest.RepeatedString:\x02\x38\x01\"\"\n\x14ProcessTraceAsyncRes\x12\n\n\x02ok\x18\x01 \x01(\x08\x32\xa3\x01\n\x0bMetloIngest\x12\x43\n\x0cProcessTrace\x12\x15.metloingest.ApiTrace\x1a\x1c.metloingest.ProcessTraceRes\x12O\n\x11ProcessTraceAsync\x12\x15.metloingest.ApiTrace\x1a!.metloingest.ProcessTraceAsyncRes(\x01\x42;Z9github.com/metlo-labs/metlo/ingestors/govxlan/metloingestb\x06proto3')

_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, globals())
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'metloingest_pb2', globals())
if _descriptor._USE_C_DESCRIPTORS == False:

  DESCRIPTOR._options = None
  DESCRIPTOR._serialized_options = b'Z9github.com/metlo-labs/metlo/ingestors/govxlan/metloingest'
  _PROCESSTRACERES_XSSDETECTEDENTRY._options = None
  _PROCESSTRACERES_XSSDETECTEDENTRY._serialized_options = b'8\001'
  _PROCESSTRACERES_SQLIDETECTEDENTRY._options = None
  _PROCESSTRACERES_SQLIDETECTEDENTRY._serialized_options = b'8\001'
  _PROCESSTRACERES_SENSITIVEDATADETECTEDENTRY._options = None
  _PROCESSTRACERES_SENSITIVEDATADETECTEDENTRY._serialized_options = b'8\001'
  _PROCESSTRACERES_DATATYPESENTRY._options = None
  _PROCESSTRACERES_DATATYPESENTRY._serialized_options = b'8\001'
  _PROCESSTRACERES_VALIDATIONERRORSENTRY._options = None
  _PROCESSTRACERES_VALIDATIONERRORSENTRY._serialized_options = b'8\001'
  _KEYVAL._serialized_start=34
  _KEYVAL._serialized_end=71
  _APIURL._serialized_start=73
  _APIURL._serialized_end=150
  _APIREQUEST._serialized_start=152
  _APIREQUEST._serialized_end=266
  _APIRESPONSE._serialized_start=268
  _APIRESPONSE._serialized_end=349
  _APIMETA._serialized_start=352
  _APIMETA._serialized_end=484
  _APITRACE._serialized_start=487
  _APITRACE._serialized_end=619
  _REPEATEDSTRING._serialized_start=621
  _REPEATEDSTRING._serialized_end=657
  _SQLIRES._serialized_start=659
  _SQLIRES._serialized_end=703
  _PROCESSTRACERES._serialized_start=706
  _PROCESSTRACERES._serialized_end=1556
  _PROCESSTRACERES_XSSDETECTEDENTRY._serialized_start=1175
  _PROCESSTRACERES_XSSDETECTEDENTRY._serialized_end=1225
  _PROCESSTRACERES_SQLIDETECTEDENTRY._serialized_start=1227
  _PROCESSTRACERES_SQLIDETECTEDENTRY._serialized_end=1300
  _PROCESSTRACERES_SENSITIVEDATADETECTEDENTRY._serialized_start=1302
  _PROCESSTRACERES_SENSITIVEDATADETECTEDENTRY._serialized_end=1391
  _PROCESSTRACERES_DATATYPESENTRY._serialized_start=1393
  _PROCESSTRACERES_DATATYPESENTRY._serialized_end=1470
  _PROCESSTRACERES_VALIDATIONERRORSENTRY._serialized_start=1472
  _PROCESSTRACERES_VALIDATIONERRORSENTRY._serialized_end=1556
  _PROCESSTRACEASYNCRES._serialized_start=1558
  _PROCESSTRACEASYNCRES._serialized_end=1592
  _METLOINGEST._serialized_start=1595
  _METLOINGEST._serialized_end=1758
# @@protoc_insertion_point(module_scope)