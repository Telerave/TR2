#!/bin/bash

# Убить процессы на портах если они запущены
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

# Запустить наблюдение за файлами
cd backend
node watchFiles.js &

# Запустить бэкенд
yarn start & 

# Запустить фронтенд
cd ../frontend
yarn start &

# Ждать завершения всех процессов
wait