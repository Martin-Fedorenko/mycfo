#!/usr/bin/env python3
"""
Generador de datos de prueba para la tabla registro
Genera movimientos de 2023, 2024 y 2025 (hasta noviembre)
con estacionalidad y tendencia creciente
"""

from datetime import datetime, timedelta
import random
import os

# Configuración
ORGANIZACION_ID = 2
USUARIO_ID = 'a3bcba1a-f001-70eb-15ba-6a851dfe22ce'


# Factores estacionales (multiplicadores por mes)
# Temporada ALTA: Nov-Dic-Ene (verano argentino) 1.3-1.4
# Temporada MEDIA: Feb-Mar-Abr-Oct 1.0-1.1
# Temporada BAJA: May-Jun-Jul-Ago-Sep 0.7-0.8
ESTACIONALIDAD = {
    1: 1.40,  # Enero - TEMPORADA ALTA (Verano)
    2: 1.10,  # Febrero - Media
    3: 1.05,  # Marzo - Media
    4: 1.00,  # Abril - Media
    5: 0.80,  # Mayo - Baja
    6: 0.70,  # Junio - TEMPORADA BAJA (Invierno)
    7: 0.65,  # Julio - TEMPORADA BAJA (Invierno)
    8: 0.70,  # Agosto - Baja
    9: 0.80,  # Septiembre - Baja
    10: 0.95,  # Octubre - Media
    11: 1.30,  # Noviembre - TEMPORADA ALTA (Pre-verano)
    12: 1.35,  # Diciembre - TEMPORADA ALTA (Verano)
}

# Categorías de ingresos con distribución
CATEGORIAS_INGRESO = [
    ('Prestación de Servicios', 0.50),  # 50% de los ingresos
    ('Ventas de Productos', 0.35),      # 35% de los ingresos
    ('Otros Ingresos', 0.15),           # 15% de los ingresos
]

# Categorías de egresos con distribución
CATEGORIAS_EGRESO = [
    ('Compras de Negocio', 0.70),  # 70% de los egresos
    ('Otros Egresos', 0.30),       # 30% de los egresos
]

# Bases iniciales para 2023
BASE_INGRESO_2023 = 400000
BASE_EGRESO_2023 = 180000

# Crecimiento anual (20% por año - más pronunciado)
CRECIMIENTO_ANUAL = 1.20

# Alquiler mensual base (se ajusta cada 6 meses)
ALQUILER_BASE_2023 = 150000

def generar_fechas_mes(year, month, cantidad=15):
    """Genera N fechas aleatorias dentro de un mes"""
    if month == 2:
        ultimo_dia = 28 if year % 4 != 0 else 29
    elif month in [4, 6, 9, 11]:
        ultimo_dia = 30
    else:
        ultimo_dia = 31
    
    fechas = []
    for i in range(cantidad):
        dia = random.randint(1, ultimo_dia)
        hora = random.randint(9, 18)
        minuto = random.randint(0, 59)
        segundo = random.randint(0, 59)
        fecha = f"{year}-{month:02d}-{dia:02d} {hora:02d}:{minuto:02d}:{segundo:02d}"
        fechas.append(fecha)
    
    return sorted(fechas)

def calcular_alquiler(year, month):
    """Calcula el alquiler según el semestre"""
    years_desde_2023 = year - 2023
    semestre = (month - 1) // 6  # 0 = ene-jun, 1 = jul-dic
    
    # Crecimiento anual del alquiler (25% por año)
    factor_crecimiento = 1.25 ** years_desde_2023
    
    # Ajuste semestral adicional (5% cada 6 meses)
    factor_semestral = 1.05 ** semestre
    
    alquiler = ALQUILER_BASE_2023 * factor_crecimiento * factor_semestral
    return -round(alquiler / 1000) * 1000  # Negativo y redondeado a miles

def seleccionar_categoria(categorias):
    """Selecciona una categoría según su probabilidad"""
    rand = random.random()
    acumulado = 0
    for categoria, probabilidad in categorias:
        acumulado += probabilidad
        if rand <= acumulado:
            return categoria
    return categorias[-1][0]  # Fallback

def calcular_monto(base, year, month, index, tipo):
    """Calcula el monto con tendencia y estacionalidad"""
    # Aplicar crecimiento anual
    years_desde_2023 = year - 2023
    factor_crecimiento = CRECIMIENTO_ANUAL ** years_desde_2023
    
    # Aplicar estacionalidad
    factor_estacional = ESTACIONALIDAD[month]
    
    # Variación aleatoria entre registros (+/- 5%)
    variacion = random.uniform(0.95, 1.05)
    
    # Tendencia creciente dentro del mes
    factor_mes = 1 + (index * 0.015)
    
    monto = base * factor_crecimiento * factor_estacional * variacion * factor_mes
    
    # Redondear a múltiplos de 500
    monto = round(monto / 500) * 500
    
    # Si es egreso, hacer negativo
    if tipo == 'Egreso':
        monto = -abs(monto)
    
    return int(monto)

def generar_numero_factura(contador):
    """Genera un número de factura secuencial con formato 000100000XXX"""
    return f"00010000{contador:04d}"

def generar_mes(year, month, base_ingreso, base_egreso, contador_factura_inicial):
    """Genera los registros de un mes completo con sus facturas"""
    mes_nombre = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ][month - 1]
    
    # Generar 15 ingresos y 12 egresos variables
    fechas_ingresos = generar_fechas_mes(year, month, 15)
    fechas_egresos = generar_fechas_mes(year, month, 12)
    
    registros = []
    facturas = []
    contador_factura = contador_factura_inicial
    
    # Comentario de mes
    estacion = ""
    if month in [11, 12, 1]:
        estacion = " (TEMPORADA ALTA - Verano)"
    elif month in [6, 7]:
        estacion = " (TEMPORADA BAJA - Invierno)"
    
    registros.append(f"\n-- {mes_nombre.upper()} {year}{estacion}")
    
    # Generar ingresos con categorías variadas y sus facturas
    total_ingresos_mes = 0
    for i in range(15):
        monto = calcular_monto(base_ingreso, year, month, i, 'Ingreso')
        total_ingresos_mes += monto
        fecha = fechas_ingresos[i]
        categoria = seleccionar_categoria(CATEGORIAS_INGRESO)
        
        # Determinar origen según categoría
        if categoria == 'Prestación de Servicios':
            origen_nombre = 'Cliente Corporativo SA'
            origen_cuit = '30-42998817-4'
        elif categoria == 'Ventas de Productos':
            origen_nombre = 'Consumidor Final'
            origen_cuit = '30-42998817-4'
        else:
            origen_nombre = 'Otros'
            origen_cuit = '30-42998817-4'
        
        # Generar factura para este ingreso
        numero_factura = generar_numero_factura(contador_factura)
        factura_doc = (
            f"\nSET @DOCUMENTO_ID = @DOCUMENTO_ID + 1;\n"
            f"INSERT INTO documento_comercial (id_documento, tipo_documento, numero_documento, fecha_emision, monto_total, moneda, categoria, version_documento, fecha_creacion, fecha_actualizacion, usuario_id, organizacion_id)\n"
            f"VALUES (@DOCUMENTO_ID, 'FACTURA', '{numero_factura}', '{fecha[:10]}', {monto}, 'ARS', '{categoria}', 'Original', '{fecha[:10]}', '{fecha[:10]}', @USUARIO_ID, @ORGANIZACION_ID);\n"
            f"INSERT INTO factura (id_documento, tipo_factura, vendedor_nombre, vendedor_cuit, vendedor_condicioniva, vendedor_domicilio, comprador_nombre, comprador_cuit, comprador_condicioniva, comprador_domicilio, estado_pago)\n"
            f"VALUES (@DOCUMENTO_ID, 'A', 'MyCFO SRL', '30-99999999-7', 'Responsable Inscripto', 'Av. Libertador 1234, CABA', '{origen_nombre}', '{origen_cuit}', 'Responsable Inscripto', 'Calle Comercial 123, CABA', 'PAGADO');"
        )
        facturas.append(factura_doc)
        
        # Generar registro vinculado a la factura
        registro = (
            f"('Ingreso', {monto},'{fecha}','{categoria}',"
            f"'{origen_nombre}','{origen_cuit}','MyCFO SRL','30-99999999-7',"
            f"'{categoria} {mes_nombre} {year} #{i+1}','{fecha[:10]}','{fecha[:10]}',"
            f"@USUARIO_ID,@ORGANIZACION_ID,'Transferencia','ARS',"
            f"NULL,NULL,NULL,NULL,NULL,NULL,NULL,'PAGADO',@DOCUMENTO_ID)"
        )
        registros.append(registro)
        contador_factura += 1
    
    # Generar egresos variables con categorías y sus facturas
    for i in range(12):
        monto = calcular_monto(base_egreso, year, month, i, 'Egreso')
        fecha = fechas_egresos[i]
        categoria = seleccionar_categoria(CATEGORIAS_EGRESO)
        
        # Determinar destino según categoría
        if categoria == 'Compras de Negocio':
            destino_nombre = 'Proveedor Mayorista SRL'
            destino_cuit = '30-19837465-3'
        else:
            destino_nombre = 'Gastos Varios'
            destino_cuit = '30-19837465-3'
        
        # Generar factura para este egreso
        numero_factura = generar_numero_factura(contador_factura)
        factura_doc = (
            f"\nSET @DOCUMENTO_ID = @DOCUMENTO_ID + 1;\n"
            f"INSERT INTO documento_comercial (id_documento, tipo_documento, numero_documento, fecha_emision, monto_total, moneda, categoria, version_documento, fecha_creacion, fecha_actualizacion, usuario_id, organizacion_id)\n"
            f"VALUES (@DOCUMENTO_ID, 'FACTURA', '{numero_factura}', '{fecha[:10]}', {abs(monto)}, 'ARS', '{categoria}', 'Original', '{fecha[:10]}', '{fecha[:10]}', @USUARIO_ID, @ORGANIZACION_ID);\n"
            f"INSERT INTO factura (id_documento, tipo_factura, vendedor_nombre, vendedor_cuit, vendedor_condicioniva, vendedor_domicilio, comprador_nombre, comprador_cuit, comprador_condicioniva, comprador_domicilio, estado_pago)\n"
            f"VALUES (@DOCUMENTO_ID, 'A', '{destino_nombre}', '{destino_cuit}', 'Responsable Inscripto', 'Calle Proveedor 456, CABA', 'MyCFO SRL', '30-99999999-7', 'Responsable Inscripto', 'Av. Libertador 1234, CABA', 'PAGADO');"
        )
        facturas.append(factura_doc)
        
        # Generar registro vinculado a la factura
        registro = (
            f"('Egreso', {monto},'{fecha}','{categoria}',"
            f"'MyCFO SRL','30-99999999-7','{destino_nombre}','{destino_cuit}',"
            f"'{categoria} {mes_nombre} {year} #{i+1}','{fecha[:10]}','{fecha[:10]}',"
            f"@USUARIO_ID,@ORGANIZACION_ID,'Efectivo','ARS',"
            f"NULL,NULL,NULL,NULL,NULL,NULL,NULL,'PAGADO',@DOCUMENTO_ID)"
        )
        registros.append(registro)
        contador_factura += 1
    
    # Agregar ALQUILER FIJO mensual (Vivienda) con factura
    alquiler = calcular_alquiler(year, month)
    fecha_alquiler = f"{year}-{month:02d}-05 10:00:00"
    
    numero_factura = generar_numero_factura(contador_factura)
    factura_alquiler = (
        f"\nSET @DOCUMENTO_ID = @DOCUMENTO_ID + 1;\n"
        f"INSERT INTO documento_comercial (id_documento, tipo_documento, numero_documento, fecha_emision, monto_total, moneda, categoria, version_documento, fecha_creacion, fecha_actualizacion, usuario_id, organizacion_id)\n"
        f"VALUES (@DOCUMENTO_ID, 'FACTURA', '{numero_factura}', '{fecha_alquiler[:10]}', {abs(alquiler)}, 'ARS', 'Vivienda', 'Original', '{fecha_alquiler[:10]}', '{fecha_alquiler[:10]}', @USUARIO_ID, @ORGANIZACION_ID);\n"
        f"INSERT INTO factura (id_documento, tipo_factura, vendedor_nombre, vendedor_cuit, vendedor_condicioniva, vendedor_domicilio, comprador_nombre, comprador_cuit, comprador_condicioniva, comprador_domicilio, estado_pago)\n"
        f"VALUES (@DOCUMENTO_ID, 'A', 'Inmobiliaria Central', '30-12345678-9', 'Responsable Inscripto', 'Av. Inmobiliaria 789, CABA', 'MyCFO SRL', '30-99999999-7', 'Responsable Inscripto', 'Av. Libertador 1234, CABA', 'PAGADO');"
    )
    facturas.append(factura_alquiler)
    
    registro_alquiler = (
        f"('Egreso', {alquiler},'{fecha_alquiler}','Vivienda',"
        f"'MyCFO SRL','30-99999999-7','Inmobiliaria Central','30-12345678-9',"
        f"'Alquiler local comercial {mes_nombre} {year}','{fecha_alquiler[:10]}','{fecha_alquiler[:10]}',"
        f"@USUARIO_ID,@ORGANIZACION_ID,'Transferencia','ARS',"
        f"NULL,NULL,NULL,NULL,NULL,NULL,NULL,'PAGADO',@DOCUMENTO_ID)"
    )
    registros.append(registro_alquiler)
    contador_factura += 1
    
    # Agregar IMPUESTOS (21% IVA sobre ingresos) - CON COMPROBANTE (no factura)
    impuesto = -round((total_ingresos_mes * 0.21) / 1000) * 1000
    fecha_impuesto = f"{year}-{month:02d}-20 14:30:00"
    
    # Generar comprobante para el impuesto
    numero_comprobante = f"IVA-{year}{month:02d}"
    comprobante_impuesto = (
        f"\nSET @DOCUMENTO_ID = @DOCUMENTO_ID + 1;\n"
        f"INSERT INTO documento_comercial (id_documento, tipo_documento, numero_documento, fecha_emision, monto_total, moneda, categoria, version_documento, fecha_creacion, fecha_actualizacion, usuario_id, organizacion_id)\n"
        f"VALUES (@DOCUMENTO_ID, 'COMPROBANTE', '{numero_comprobante}', '{fecha_impuesto[:10]}', {abs(impuesto)}, 'ARS', 'Impuestos y Tasas', 'Original', '{fecha_impuesto[:10]}', '{fecha_impuesto[:10]}', @USUARIO_ID, @ORGANIZACION_ID);"
    )
    facturas.append(comprobante_impuesto)
    
    registro_impuesto = (
        f"('Egreso', {impuesto},'{fecha_impuesto}','Impuestos y Tasas',"
        f"'MyCFO SRL','30-99999999-7','AFIP','30-99999999-0',"
        f"'IVA {mes_nombre} {year}','{fecha_impuesto[:10]}','{fecha_impuesto[:10]}',"
        f"@USUARIO_ID,@ORGANIZACION_ID,'Transferencia','ARS',"
        f"NULL,NULL,NULL,NULL,NULL,NULL,NULL,'PAGADO',@DOCUMENTO_ID)"
    )
    registros.append(registro_impuesto)
    
    return registros, facturas, contador_factura

def generar_sql_completo():
    """Genera el archivo SQL completo con facturas"""
    output = []
    
    # Header con inicialización de variables
    header = """
SET @ORGANIZACION_ID := 2;
SET @USUARIO_ID   := 'a3bcba1a-f001-70eb-15ba-6a851dfe22ce';
SET @DOCUMENTO_ID = 0;


"""
    output.append(header)
    
    # Primero generamos todas las facturas
    todas_facturas = []
    contador_factura = 1
    
    # 2023 completo (12 meses)
    for month in range(1, 13):
        _, facturas, contador_factura = generar_mes(2023, month, BASE_INGRESO_2023, BASE_EGRESO_2023, contador_factura)
        todas_facturas.extend(facturas)
    
    # 2024 completo (12 meses)
    base_ingreso_2024 = BASE_INGRESO_2023 * CRECIMIENTO_ANUAL
    base_egreso_2024 = BASE_EGRESO_2023 * CRECIMIENTO_ANUAL
    for month in range(1, 13):
        _, facturas, contador_factura = generar_mes(2024, month, base_ingreso_2024, base_egreso_2024, contador_factura)
        todas_facturas.extend(facturas)
    
    # 2025 hasta noviembre (11 meses)
    base_ingreso_2025 = base_ingreso_2024 * CRECIMIENTO_ANUAL
    base_egreso_2025 = base_egreso_2024 * CRECIMIENTO_ANUAL
    for month in range(1, 12):  # Hasta noviembre
        _, facturas, contador_factura = generar_mes(2025, month, base_ingreso_2025, base_egreso_2025, contador_factura)
        todas_facturas.extend(facturas)
    
    # Agregar todas las facturas al output
    output.append("\n-- ========================================")
    output.append("-- FACTURAS")
    output.append("-- ========================================")
    for factura in todas_facturas:
        output.append(factura)
    
    # Ahora generamos los registros
    output.append("\n\n-- ========================================")
    output.append("-- REGISTROS")
    output.append("-- ========================================")
    output.append("\nINSERT INTO registro_db.registro (")
    output.append("    tipo, monto_total, fecha_emision, categoria,")
    output.append("    origen_nombre, origen_cuit, destino_nombre, destino_cuit,")
    output.append("    descripcion, fecha_creacion, fecha_actualizacion,")
    output.append("    usuario_id, organizacion_id, medio_pago, moneda,")
    output.append("    fecha_vencimiento, monto_pagado, cantidad_cuotas,")
    output.append("    cuotas_pagadas, monto_cuota, tasa_interes, periodicidad,")
    output.append("    estado, id_documento")
    output.append(") VALUES")
    
    todos_registros = []
    contador_factura = 1
    
    # 2023 completo (12 meses)
    for month in range(1, 13):
        registros, _, contador_factura = generar_mes(2023, month, BASE_INGRESO_2023, BASE_EGRESO_2023, contador_factura)
        todos_registros.extend(registros)
    
    # 2024 completo (12 meses)
    for month in range(1, 13):
        registros, _, contador_factura = generar_mes(2024, month, base_ingreso_2024, base_egreso_2024, contador_factura)
        todos_registros.extend(registros)
    
    # 2025 hasta noviembre (11 meses)
    for month in range(1, 12):  # Hasta noviembre
        registros, _, contador_factura = generar_mes(2025, month, base_ingreso_2025, base_egreso_2025, contador_factura)
        todos_registros.extend(registros)
    
    # Unir todos los registros con comas
    for i, registro in enumerate(todos_registros):
        if registro.startswith('\n--'):
            # Es un comentario
            output.append(registro)
        else:
            # Es un registro
            if i < len(todos_registros) - 1 and not todos_registros[i + 1].startswith('\n--'):
                output.append(registro + ',')
            else:
                output.append(registro + (','))
    
    # Remover la última coma y agregar punto y coma
    output[-1] = output[-1].rstrip(',') + ';'
    
    return '\n'.join(output)

if __name__ == '__main__':
    sql = generar_sql_completo()
    
    # Obtener el directorio donde está este script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_file = os.path.join(script_dir, 'init registro - completo.sql')
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(sql)
    
    print("✅ Archivo 'init registro - completo.sql' generado exitosamente!")
    print(f"📁 Ubicación: {output_file}")
    print(f"📊 Total de registros: {35 * 29} (35 meses × 29 registros/mes)")
    print("   - 15 ingresos variables por mes")
    print("   - 12 egresos variables por mes")
    print("   - 1 alquiler fijo mensual (Vivienda)")
    print("   - 1 impuesto mensual (21% IVA)")
    print(f"📄 Total de documentos: {35 * 29} (35 meses × 29 documentos/mes)")
    print("   - 28 facturas por mes (ingresos, egresos y alquiler)")
    print("   - 1 comprobante por mes (impuestos)")
    print("   - Todos vinculados mediante id_documento")
    print("📅 Período: Enero 2023 - Noviembre 2025")
    print("📈 Incluye:")
    print("   - Temporada ALTA: Nov-Dic-Ene (verano)")
    print("   - Crecimiento anual: 20%")
    print("   - Categorías realistas de negocio")
    print("   - Alquiler con ajuste semestral")
    print("   - IVA calculado sobre ingresos")
    print("   - Facturas: documento_comercial + factura")
    print("   - Comprobantes: documento_comercial (impuestos)")
