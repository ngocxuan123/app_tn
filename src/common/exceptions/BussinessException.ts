export function BussinessException(message: string, inner: any) {
    this.message = message;
    this.inner = inner;
}