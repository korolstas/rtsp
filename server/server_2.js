const http = require('http');
const fs = require('fs');
const { exec } = require('child_process');
const findRemoveSync = require('find-remove')

// "start2": "nodemon server_2.js",
const PORT = 8080;

setInterval(() => {
  var result = findRemoveSync('./videos/', { age: { seconds: 30 }, extensions: '.ts' });
  console.log(result);
}, 5000);

http.createServer((request, response) => {
    console.log('Request starting...', new Date());

    const headers = {
        'Access-Control-Allow-Origin': '*', // Разрешаем запросы с любых источников
        'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
        'Access-Control-Allow-Headers': 'Content-Type', // Разрешаем отправку JSON с клиента
        'Access-Control-Max-Age': 2592000, // Кэширование разрешений на 30 дней
    };

    // Обработка preflight-запросов (OPTIONS)
    if (request.method === 'OPTIONS') {
        response.writeHead(204, headers);
        response.end();
        return;
    }

    if (request.url === '/restart-server' && request.method === 'POST') {
      response.writeHead(200, headers);

      console.log('Перезапуск сервера...');
      setTimeout(() => {
          process.exit(0); // Завершаем текущий процесс
      }, 100); // Даем время завершить ответ
      response.end(JSON.stringify({ success: true, message: 'Successfully restart' }));

      return;
    }

    if (request.url === '/on-live' && request.method === 'POST') {
        response.writeHead(200, headers);
        response.end(JSON.stringify({ success: true, message: 'Со мной все гуд!' }));

      return;
    }

    if (request.url === '/cleaner' && request.method === 'POST') {
      response.writeHead(200, headers); // Добавляем CORS-заголовки

      const cleaner = 'start cleaner';
      exec(cleaner, (error, stdout, stderr) => {
          if (error) {
              console.error(`Ошибка запуска cleaner: ${error.message}`);
              response.writeHead(500, headers); // Добавляем CORS-заголовки для ошибок
              response.end(JSON.stringify({ success: false, message: 'Ошибка запуска cleaner' }));
              return;
          }
          console.log(`cleaner stdout: ${stdout}`);
          console.log(`cleaner stderr: ${stderr}`);
          response.writeHead(200, headers);
          response.end(JSON.stringify({ success: true, message: 'cleaner запущен' }));
      });

      return;
  }

    // Маршрут для запуска ffmpeg
    if (request.url === '/start-stream' && request.method === 'POST') {
        response.writeHead(200, headers); // Добавляем CORS-заголовки

        const login = 'admin';
        const passwd = 'testtest71';
        const ipAddress = '134.17.174.108';
        const urlffpeg = `rtsp://${login}:${passwd}@${ipAddress}/doc/page/preview.asp`;
        const ffmpegCommand = `ffmpeg -i ${urlffpeg} -fflags flush_packets -max_delay 2 -flags -global_header -hls_time 2 -hls_list_size 3 -vcodec copy -y ./videos/index.m3u8`;
        exec(ffmpegCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Ошибка запуска ffmpeg: ${error.message}`);
                response.writeHead(500, headers); // Добавляем CORS-заголовки для ошибок
                response.end(JSON.stringify({ success: false, message: 'Ошибка запуска ffmpeg' }));
                return;
            }
            console.log(`ffmpeg stdout: ${stdout}`);
            console.log(`ffmpeg stderr: ${stderr}`);
            response.writeHead(200, headers);
            response.end(JSON.stringify({ success: true, message: 'Поток запущен' }));
        });

        return;
    }

    // Обработка запроса файлов
    const filePath = '.' + request.url;
    console.log(filePath);

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // Файл не найден, возвращаем 404
                fs.readFile('./404.html', (err, notFoundContent) => {
                    response.writeHead(404, { ...headers, 'Content-Type': 'text/html' });
                    response.end(notFoundContent || '404 Not Found', 'utf-8');
                });
            } else {
                // Другая ошибка, возвращаем 500
                response.writeHead(500, headers);
                response.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
            }
        } else {
            // Файл найден, возвращаем содержимое
            const contentType = filePath.endsWith('.m3u8') ? 'application/vnd.apple.mpegurl' : 'text/html';
            response.writeHead(200, { ...headers, 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });
}).listen(PORT);

console.log(`Сервер запущен на порту ${PORT}`);
