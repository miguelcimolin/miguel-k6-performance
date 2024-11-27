import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import http from 'k6/http';
import { check } from 'k6';
import { Trend, Rate } from 'k6/metrics';

export const getContactsDuration = new Trend('get_contacts', true); //trend no get
export const RateContentOK = new Rate('content_OK'); // rate no status code

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.12'], // 12% de margem
    get_contacts: ['p(95)<5700'], // 5700 aqui
    content_OK: ['rate>0.95'], // 95% das respostas tem que dar certo
  },
  stages: [
    { duration: '10s', target: 10 },
    { duration: '50s', target: 10 }, // 1m
    { duration: '10s', target: 60 },
    { duration: '50s', target: 60 }, // 2m
    { duration: '10s', target: 100 },
    { duration: '40s', target: 100 },
    { duration: '10s', target: 180 }, // 3m
    { duration: '40s', target: 180 },
    { duration: '20s', target: 300 }, // 4m
    { duration: '60s', target: 300 }, // 5m
  ],
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

export default function () {
  const baseUrl = 'https://api.thecatapi.com/v1/images/search';

  const params = {
    headers: {
      'Content-Type': 'application/json',
      "x-api-key": "live_HKm2yfEB9OLkeFE7wpts2nuAXHtMzfNNNCIsMf5RBfA2MHKy6y3xats4YeRTefFI"
    },
  };

  const response = http.get(baseUrl, params);

  getContactsDuration.add(response.timings.duration);

  RateContentOK.add(response.status === 200);

  check(response, {
    'GET Gato - Status 200': () => response.status === 200,
  });
}
