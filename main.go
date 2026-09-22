package main

import (
	"bufio"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

func main() {
	if err := loadEnvFile(filepath.Join("config", ".env")); err != nil && !os.IsNotExist(err) {
		log.Fatalf("load configuration: %v", err)
	}
	if err := os.MkdirAll("data", 0o755); err != nil {
		log.Fatalf("create data directory: %v", err)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8839"
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/request-consultation/", func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, "/#contact-form", http.StatusMovedPermanently)
	})
	mux.Handle("/", http.FileServer(http.Dir("public")))

	log.Printf("LaBass Technologies is running at http://0.0.0.0:%s", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}

// loadEnvFile reads the Uppr-managed configuration file without overriding
// environment variables supplied directly by the runtime.
func loadEnvFile(path string) error {
	file, err := os.Open(path)
	if err != nil {
		return err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		key, value, found := strings.Cut(line, "=")
		if !found {
			continue
		}
		key = strings.TrimSpace(key)
		value = strings.Trim(strings.TrimSpace(value), "\"'")
		if key != "" && os.Getenv(key) == "" {
			if err := os.Setenv(key, value); err != nil {
				return err
			}
		}
	}
	return scanner.Err()
}
