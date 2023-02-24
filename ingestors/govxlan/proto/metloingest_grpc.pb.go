// Code generated by protoc-gen-go-grpc. DO NOT EDIT.
// versions:
// - protoc-gen-go-grpc v1.2.0
// - protoc             v3.21.12
// source: proto/metloingest.proto

package metloingest

import (
	context "context"
	grpc "google.golang.org/grpc"
	codes "google.golang.org/grpc/codes"
	status "google.golang.org/grpc/status"
)

// This is a compile-time assertion to ensure that this generated file
// is compatible with the grpc package it is being compiled against.
// Requires gRPC-Go v1.32.0 or later.
const _ = grpc.SupportPackageIsVersion7

// MetloIngestClient is the client API for MetloIngest service.
//
// For semantics around ctx use and closing/ending streaming RPCs, please refer to https://pkg.go.dev/google.golang.org/grpc/?tab=doc#ClientConn.NewStream.
type MetloIngestClient interface {
	ProcessTrace(ctx context.Context, in *ApiTrace, opts ...grpc.CallOption) (*ProcessTraceRes, error)
	ProcessTraceAsync(ctx context.Context, in *ApiTrace, opts ...grpc.CallOption) (*ProcessTraceAsyncRes, error)
}

type metloIngestClient struct {
	cc grpc.ClientConnInterface
}

func NewMetloIngestClient(cc grpc.ClientConnInterface) MetloIngestClient {
	return &metloIngestClient{cc}
}

func (c *metloIngestClient) ProcessTrace(ctx context.Context, in *ApiTrace, opts ...grpc.CallOption) (*ProcessTraceRes, error) {
	out := new(ProcessTraceRes)
	err := c.cc.Invoke(ctx, "/metloingest.MetloIngest/ProcessTrace", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *metloIngestClient) ProcessTraceAsync(ctx context.Context, in *ApiTrace, opts ...grpc.CallOption) (*ProcessTraceAsyncRes, error) {
	out := new(ProcessTraceAsyncRes)
	err := c.cc.Invoke(ctx, "/metloingest.MetloIngest/ProcessTraceAsync", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// MetloIngestServer is the server API for MetloIngest service.
// All implementations must embed UnimplementedMetloIngestServer
// for forward compatibility
type MetloIngestServer interface {
	ProcessTrace(context.Context, *ApiTrace) (*ProcessTraceRes, error)
	ProcessTraceAsync(context.Context, *ApiTrace) (*ProcessTraceAsyncRes, error)
	mustEmbedUnimplementedMetloIngestServer()
}

// UnimplementedMetloIngestServer must be embedded to have forward compatible implementations.
type UnimplementedMetloIngestServer struct {
}

func (UnimplementedMetloIngestServer) ProcessTrace(context.Context, *ApiTrace) (*ProcessTraceRes, error) {
	return nil, status.Errorf(codes.Unimplemented, "method ProcessTrace not implemented")
}
func (UnimplementedMetloIngestServer) ProcessTraceAsync(context.Context, *ApiTrace) (*ProcessTraceAsyncRes, error) {
	return nil, status.Errorf(codes.Unimplemented, "method ProcessTraceAsync not implemented")
}
func (UnimplementedMetloIngestServer) mustEmbedUnimplementedMetloIngestServer() {}

// UnsafeMetloIngestServer may be embedded to opt out of forward compatibility for this service.
// Use of this interface is not recommended, as added methods to MetloIngestServer will
// result in compilation errors.
type UnsafeMetloIngestServer interface {
	mustEmbedUnimplementedMetloIngestServer()
}

func RegisterMetloIngestServer(s grpc.ServiceRegistrar, srv MetloIngestServer) {
	s.RegisterService(&MetloIngest_ServiceDesc, srv)
}

func _MetloIngest_ProcessTrace_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(ApiTrace)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(MetloIngestServer).ProcessTrace(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/metloingest.MetloIngest/ProcessTrace",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(MetloIngestServer).ProcessTrace(ctx, req.(*ApiTrace))
	}
	return interceptor(ctx, in, info, handler)
}

func _MetloIngest_ProcessTraceAsync_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(ApiTrace)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(MetloIngestServer).ProcessTraceAsync(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/metloingest.MetloIngest/ProcessTraceAsync",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(MetloIngestServer).ProcessTraceAsync(ctx, req.(*ApiTrace))
	}
	return interceptor(ctx, in, info, handler)
}

// MetloIngest_ServiceDesc is the grpc.ServiceDesc for MetloIngest service.
// It's only intended for direct use with grpc.RegisterService,
// and not to be introspected or modified (even as a copy)
var MetloIngest_ServiceDesc = grpc.ServiceDesc{
	ServiceName: "metloingest.MetloIngest",
	HandlerType: (*MetloIngestServer)(nil),
	Methods: []grpc.MethodDesc{
		{
			MethodName: "ProcessTrace",
			Handler:    _MetloIngest_ProcessTrace_Handler,
		},
		{
			MethodName: "ProcessTraceAsync",
			Handler:    _MetloIngest_ProcessTraceAsync_Handler,
		},
	},
	Streams:  []grpc.StreamDesc{},
	Metadata: "proto/metloingest.proto",
}