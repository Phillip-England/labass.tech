FROM golang:1.27-alpine AS build

WORKDIR /app
COPY go.mod ./
COPY main.go ./
RUN go build -trimpath -ldflags="-s -w" -o /out/labass-tech .

FROM alpine:3.22

WORKDIR /app
COPY --from=build /out/labass-tech /app/labass-tech
COPY public /app/public

EXPOSE 18080

CMD ["/app/labass-tech"]
