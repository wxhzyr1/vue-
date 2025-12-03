import request from "./apiConfig";
export function getMapData(params: any) {
    params = {
        ...params,
        subdistrict: 0,
        extensions: "all",
    }
  return request({
    url: 'v3/config/district',
    method: 'get',
    params
  })
}