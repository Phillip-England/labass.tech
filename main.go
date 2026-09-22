package main

import (
	"log"
	"net/http"
	"os"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	mux := http.NewServeMux()
	mux.Handle("/", http.FileServer(http.Dir("public")))

	log.Printf("LaBass Technologies is running at http://localhost:%s", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}
