FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema necesarias para Prophet y scipy
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements y instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código de la aplicación
COPY forecast.py .

# Exponer el puerto
EXPOSE 8088

# Comando para ejecutar la aplicación
CMD ["python", "forecast.py"]

