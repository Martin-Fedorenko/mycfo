package registro.movimientosexcel.services;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class CategorySuggestionService {
    
    private final Map<String, String> categoryMappings = new HashMap<>();
    
    public CategorySuggestionService() {
        // Mapeo de palabras clave a categorías sugeridas
        categoryMappings.put("mercado", "Ventas");
        categoryMappings.put("venta", "Ventas");
        categoryMappings.put("pago", "Cobranzas");
        categoryMappings.put("cobro", "Cobranzas");
        categoryMappings.put("transferencia", "Transferencias");
        categoryMappings.put("deposito", "Depósitos");
        categoryMappings.put("retiro", "Retiros");
        categoryMappings.put("compra", "Compras");
        categoryMappings.put("gasto", "Gastos");
        categoryMappings.put("servicio", "Servicios");
        categoryMappings.put("alquiler", "Alquiler");
        categoryMappings.put("sueldo", "Sueldos");
        categoryMappings.put("salario", "Sueldos");
        categoryMappings.put("impuesto", "Impuestos");
        categoryMappings.put("tax", "Impuestos");
        categoryMappings.put("banco", "Servicios Bancarios");
        categoryMappings.put("tarjeta", "Tarjetas");
        categoryMappings.put("credito", "Créditos");
        categoryMappings.put("prestamo", "Préstamos");
        categoryMappings.put("inversion", "Inversiones");
        categoryMappings.put("ahorro", "Ahorros");
    }
    
    public String sugerirCategoria(String descripcion) {
        if (descripcion == null || descripcion.trim().isEmpty()) {
            return "Sin categorizar";
        }
        
        String descripcionLower = descripcion.toLowerCase();
        
        // Buscar coincidencias en el mapeo
        for (Map.Entry<String, String> entry : categoryMappings.entrySet()) {
            if (descripcionLower.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        
        // Si no hay coincidencia específica, sugerir categoría genérica
        return "General";
    }
}
