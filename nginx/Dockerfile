FROM nginx:latest

RUN rm -rf /usr/share/nginx/html/*

COPY ./website/ /usr/share/nginx/html/
COPY ./nginx.conf /etc/nginx/nginx.conf
#COPY ./default.conf /etc/nginx/conf.d/default.conf

# Debugging - list the contents of the destination directory
RUN ls -R /usr/share/nginx/html/ \
    && chmod -R 777 /usr/share/nginx/html

EXPOSE 80
