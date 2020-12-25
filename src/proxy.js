import { createProxyMiddleware } from 'http-proxy-middleware';
import { settings } from '~/config';

function filterRequests(pathname, req) {
  const whitelist = settings.searchkit.esProxyWhitelist;

  const tomatch = whitelist[req.method] || [];
  return tomatch.filter((m) => pathname.match(m)).length > 0;
}

export default function (target) {
  const proxy = createProxyMiddleware(filterRequests, { target });
  proxy.id = 'volto-searchkit-block';

  return proxy;
}
