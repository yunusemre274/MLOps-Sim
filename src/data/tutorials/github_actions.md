# GitHub Actions ile CI/CD

## GitHub Actions Nedir?
GitHub'ın yerleşik CI/CD platformu.
Push, PR, schedule gibi olaylarla otomatik workflow çalıştırır.

## Temel Yapı
Dosya: .github/workflows/ci.yml

  name: CI Pipeline
  on:
    push:
      branches: [main]
    pull_request:
      branches: [main]

  jobs:
    build:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - name: Setup Python
          uses: actions/setup-python@v5
          with:
            python-version: '3.11'
        - name: Install deps
          run: pip install -r requirements.txt
        - name: Run tests
          run: pytest

## Docker Build ve Push

  jobs:
    deploy:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - name: Build image
          run: docker build -t my-app:latest .
        - name: Push to registry
          run: |
            echo ${{ secrets.REGISTRY_TOKEN }} | docker login -u user --password-stdin
            docker push my-app:latest

## Job Bağımlılıkları

  jobs:
    test:
      runs-on: ubuntu-latest
      steps: ...
    deploy:
      needs: test
      if: github.ref == 'refs/heads/main'
      runs-on: ubuntu-latest
      steps: ...

## Ortam Değişkenleri ve Secrets
- Settings > Secrets and variables > Actions
- Workflow'da: ${{ secrets.MY_SECRET }}
- env bloğu ile ortam değişkeni tanımla

## İyi Pratikler
1. Her PR'da test çalıştır
2. Main branch'e merge'de deploy et
3. Docker layer cache kullan
4. Secret'ları asla log'a yazdırma
5. Matrix strategy ile birden fazla versiyon test et
