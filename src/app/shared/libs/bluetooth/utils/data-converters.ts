export function dataViewToAsciiString(data_view: DataView): string {
  const decoder = new TextDecoder('ascii');
  return decoder.decode(data_view);
}

export function dataViewToDecimal(data_view: DataView): number {
  if (data_view.byteLength === 0) {
    console.warn('DataView is empty');
    return -1;
  }
  return data_view.getUint8(0);
}

export function dataViewToHighLowBytes(dataView: DataView): {
  high_byte: number;
  low_byte: number;
} {
  if (dataView.byteLength < 2) {
    console.error('DataView does not contain enough bytes (expected 2)');
    return { high_byte: -1, low_byte: -1 };
  }

  const value16bit = dataView.getUint16(0, false);
  const high_byte = (value16bit >> 8) & 0xff;
  const low_byte = value16bit & 0xff;

  return { high_byte, low_byte };
}
