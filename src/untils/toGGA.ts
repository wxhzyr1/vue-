export function toGGA(
  latitude: number,
  longitude: number,
  fixQuality: number = 1,
  satellites: number = 12,
  hdop: number = 0.9,
  altitude: number = 0,
  geoidSeparation: number = 0,
  differentialAge: number = 1.0,
  stationID: string = '0129'
): string {
  // 获取 UTC 时间（格式：hhmmss.ss）
  const now = new Date();
  const utcHours = now.getUTCHours().toString().padStart(2, '0');
  const utcMinutes = now.getUTCMinutes().toString().padStart(2, '0');
  const utcSeconds = now.getUTCSeconds().toString().padStart(2, '0');
  const utcTime = `${utcHours}${utcMinutes}${utcSeconds}.00`;

  // 转换纬度格式：ddmm.mmmmmm
  const latDir: 'N' | 'S' = latitude >= 0 ? 'N' : 'S';
  const absLat = Math.abs(latitude);
  const latDeg = Math.floor(absLat);
  const latMin = (absLat - latDeg) * 60;
  const latStr = `${latDeg.toString().padStart(2, '0')}${latMin.toFixed(6).padStart(9, '0')}`;

  // 转换经度格式：dddmm.mmmmmm
  const lonDir: 'E' | 'W' = longitude >= 0 ? 'E' : 'W';
  const absLon = Math.abs(longitude);
  const lonDeg = Math.floor(absLon);
  const lonMin = (absLon - lonDeg) * 60;
  const lonStr = `${lonDeg.toString().padStart(3, '0')}${lonMin.toFixed(6).padStart(9, '0')}`;

  // 拼接主体数据（不含校验和）
  const fields: (string | number)[] = [
    '$GNGGA',
    utcTime,
    latStr,
    latDir,
    lonStr,
    lonDir,
    fixQuality,
    satellites.toString().padStart(2, '0'),
    hdop.toFixed(1),
    altitude,
    'M',
    geoidSeparation,
    'M',
    differentialAge.toFixed(1),
    stationID
  ];
  const ggaWithoutChecksum = fields.join(',');

  // 计算校验和（XOR 从 $ 后到 * 前所有字符）
  const checksum = [...ggaWithoutChecksum.slice(1)]
    .reduce((acc, char) => acc ^ char.charCodeAt(0), 0)
    .toString(16)
    .toUpperCase()
    .padStart(2, '0');

  return `${ggaWithoutChecksum}*${checksum}`;
}
