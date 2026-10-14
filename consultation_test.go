package main

import (
	"bytes"
	"encoding/json"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"sync/atomic"
	"testing"
)

func TestConsultationHandler(t *testing.T) {
	var calls atomic.Int32
	gateway := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		calls.Add(1)
		if r.URL.Path != "/v1/email" || r.Method != http.MethodPost || r.Header.Get("Authorization") != "Bearer eg_test" || r.Header.Get("Content-Type") != "application/json" {
			t.Errorf("unexpected gateway request: %s %s, auth=%q, content-type=%q", r.Method, r.URL.Path, r.Header.Get("Authorization"), r.Header.Get("Content-Type"))
		}
		var email emailRequest
		if err := json.NewDecoder(r.Body).Decode(&email); err != nil {
			t.Errorf("decode email: %v", err)
		}
		if email.From != "noreply@messages.englandsoftware.com" || email.To != "inquiries@example.com" || email.ReplyTo != "person@example.com" || !strings.Contains(email.TextBody, "Project details:\nA new camera system") {
			t.Errorf("unexpected email: %+v", email)
		}
		w.WriteHeader(http.StatusCreated)
	}))
	defer gateway.Close()
	t.Setenv("EGATE_HOST", gateway.URL)
	t.Setenv("EGATE_API_KEY", "eg_test")
	t.Setenv("CONSULTATION_RECIPIENT_EMAIL", "inquiries@example.com")

	form := url.Values{
		"name":            {"Pat Example"},
		"email":           {"person@example.com"},
		"serviceInterest": {"Physical security / surveillance"},
		"message":         {"A new camera system"},
	}
	submit := func(values url.Values) *httptest.ResponseRecorder {
		t.Helper()
		r := httptest.NewRequest(http.MethodPost, "/api/consultation", strings.NewReader(values.Encode()))
		r.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		w := httptest.NewRecorder()
		consultationHandler(gateway.Client())(w, r)
		return w
	}

	if got := submit(form); got.Code != http.StatusOK {
		t.Fatalf("valid form status = %d: %s", got.Code, got.Body.String())
	}
	if calls.Load() != 1 {
		t.Fatalf("valid form gateway calls = %d", calls.Load())
	}
	var multipartBody bytes.Buffer
	writer := multipart.NewWriter(&multipartBody)
	for key, values := range form {
		if err := writer.WriteField(key, values[0]); err != nil {
			t.Fatal(err)
		}
	}
	if err := writer.Close(); err != nil {
		t.Fatal(err)
	}
	multipartRequest := httptest.NewRequest(http.MethodPost, "/api/consultation", &multipartBody)
	multipartRequest.Header.Set("Content-Type", writer.FormDataContentType())
	multipartResponse := httptest.NewRecorder()
	consultationHandler(gateway.Client())(multipartResponse, multipartRequest)
	if multipartResponse.Code != http.StatusOK || calls.Load() != 2 {
		t.Fatalf("browser form status = %d, gateway calls = %d", multipartResponse.Code, calls.Load())
	}

	trapped := url.Values{}
	for key, values := range form {
		trapped[key] = values
	}
	trapped.Set("website", "https://spam.example")
	if got := submit(trapped); got.Code != http.StatusOK || calls.Load() != 2 {
		t.Fatalf("honeypot status = %d, gateway calls = %d", got.Code, calls.Load())
	}

	invalid := url.Values{}
	for key, values := range form {
		invalid[key] = values
	}
	invalid.Set("email", "invalid")
	if got := submit(invalid); got.Code != http.StatusBadRequest || calls.Load() != 2 {
		t.Fatalf("invalid form status = %d, gateway calls = %d", got.Code, calls.Load())
	}

	t.Setenv("EGATE_API_KEY", "")
	if got := submit(form); got.Code != http.StatusServiceUnavailable || calls.Load() != 2 {
		t.Fatalf("missing key status = %d, gateway calls = %d", got.Code, calls.Load())
	}
	t.Setenv("EGATE_API_KEY", "eg_test")
	t.Setenv("CONSULTATION_RECIPIENT_EMAIL", "")
	if got := submit(form); got.Code != http.StatusServiceUnavailable || calls.Load() != 2 {
		t.Fatalf("missing recipient status = %d, gateway calls = %d", got.Code, calls.Load())
	}
	t.Setenv("CONSULTATION_RECIPIENT_EMAIL", "invalid")
	if got := submit(form); got.Code != http.StatusServiceUnavailable || calls.Load() != 2 {
		t.Fatalf("invalid recipient status = %d, gateway calls = %d", got.Code, calls.Load())
	}
}
