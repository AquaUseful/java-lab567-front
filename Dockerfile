FROM nginx:stable AS prod
COPY . /usr/share/nginx/html
EXPOSE 80
