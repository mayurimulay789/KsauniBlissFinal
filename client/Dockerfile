# Using a simple nginx container
FROM nginx:alpine

# Copy pre-built assets - we'll build locally first
COPY dist /usr/share/nginx/html
# Fix permissions on the static files
RUN chmod -R 755 /usr/share/nginx/html
# Copy nginx configuration for HTTPS support
COPY nginx-conf/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
