FROM node:12

# Copying package.json and running
# npm install are automatically handled

# Add source files
COPY . .

# And then compile the frontend
RUN npm run build

CMD ["npm", "start"]
EXPOSE 8080
