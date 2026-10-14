package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/mail"
	"net/url"
	"os"
	"strings"
	"time"
)

const consultationRecipient = "support@labass.tech"

type emailRequest struct {
	From     string `json:"from"`
	To       string `json:"to"`
	Subject  string `json:"subject"`
	TextBody string `json:"text_body"`
	ReplyTo  string `json:"reply_to"`
}

func consultationHandler(client *http.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		if r.Method != http.MethodPost {
			w.Header().Set("Allow", http.MethodPost)
			http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
			return
		}
		r.Body = http.MaxBytesReader(w, r.Body, 16<<10)
		var parseErr error
		if strings.HasPrefix(r.Header.Get("Content-Type"), "multipart/form-data") {
			parseErr = r.ParseMultipartForm(16 << 10)
		} else {
			parseErr = r.ParseForm()
		}
		if parseErr != nil {
			http.Error(w, `{"error":"Invalid form"}`, http.StatusBadRequest)
			return
		}
		// Answer as if the form succeeded, but never send mail for a filled trap.
		if strings.TrimSpace(r.FormValue("website")) != "" {
			w.WriteHeader(http.StatusOK)
			_, _ = io.WriteString(w, `{"ok":true}`)
			return
		}

		name := strings.TrimSpace(r.FormValue("name"))
		phone := strings.TrimSpace(r.FormValue("phone"))
		email := strings.TrimSpace(r.FormValue("email"))
		organization := strings.TrimSpace(r.FormValue("organization"))
		service := strings.TrimSpace(r.FormValue("serviceInterest"))
		message := strings.TrimSpace(r.FormValue("message"))
		address, emailErr := mail.ParseAddress(email)
		if name == "" || service == "" || emailErr != nil || address.Address != email ||
			len(name) > 150 || len(phone) > 100 || len(email) > 254 ||
			len(organization) > 200 || len(service) > 150 || len(message) > 5000 {
			http.Error(w, `{"error":"Please check the form fields"}`, http.StatusBadRequest)
			return
		}

		key := os.Getenv("EGATE_API_KEY")
		if key == "" {
			log.Print("consultation email unavailable: EGATE_API_KEY is not set")
			http.Error(w, `{"error":"Unable to send your request"}`, http.StatusServiceUnavailable)
			return
		}
		host := os.Getenv("EGATE_HOST")
		if host == "" {
			host = "https://egate.englandsoftware.com"
		}
		endpoint, err := url.Parse(strings.TrimRight(host, "/") + "/v1/email")
		if err != nil || (endpoint.Scheme != "https" && endpoint.Scheme != "http") || endpoint.Host == "" {
			log.Print("consultation email unavailable: invalid EGATE_HOST")
			http.Error(w, `{"error":"Unable to send your request"}`, http.StatusServiceUnavailable)
			return
		}

		body, _ := json.Marshal(emailRequest{
			From:     "noreply@messages.englandsoftware.com",
			To:       consultationRecipient,
			Subject:  "New Website Inquiry — LaBass Technologies",
			TextBody: fmt.Sprintf("Name: %s\nPhone: %s\nEmail: %s\nOrganization / facility: %s\nPrimary service interest: %s\n\nProject details:\n%s", name, phone, email, organization, service, message),
			ReplyTo:  email,
		})
		request, err := http.NewRequestWithContext(r.Context(), http.MethodPost, endpoint.String(), bytes.NewReader(body))
		if err != nil {
			log.Printf("create consultation email request: %v", err)
			http.Error(w, `{"error":"Unable to send your request"}`, http.StatusServiceUnavailable)
			return
		}
		request.Header.Set("Authorization", "Bearer "+key)
		request.Header.Set("Content-Type", "application/json")
		request.Header.Set("Accept", "application/json")

		// Use a bounded request without retrying an uncertain send.
		ctx, cancel := context.WithTimeout(request.Context(), 10*time.Second)
		defer cancel()
		response, err := client.Do(request.WithContext(ctx))
		if err != nil {
			log.Printf("consultation email gateway request failed: %v", err)
			http.Error(w, `{"error":"Unable to send your request"}`, http.StatusBadGateway)
			return
		}
		defer response.Body.Close()
		if response.StatusCode < 200 || response.StatusCode >= 300 {
			log.Printf("consultation email gateway returned status %d", response.StatusCode)
			http.Error(w, `{"error":"Unable to send your request"}`, http.StatusBadGateway)
			return
		}
		w.WriteHeader(http.StatusOK)
		_, _ = io.WriteString(w, `{"ok":true}`)
	}
}
