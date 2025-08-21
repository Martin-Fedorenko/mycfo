package consolidacion.mercadopago.dtos;

import java.math.BigDecimal;
import java.time.LocalDate;

public class PaymentDTO {
    private Long mpPaymentId;
    private LocalDate fecha;
    private BigDecimal total;
    private String detalle;
    private String comprador;
    private String comprobante;
    private String estado;

    // getters/setters
    public Long getMpPaymentId(){return mpPaymentId;} public void setMpPaymentId(Long v){this.mpPaymentId=v;}
    public LocalDate getFecha(){return fecha;} public void setFecha(LocalDate v){this.fecha=v;}
    public BigDecimal getTotal(){return total;} public void setTotal(BigDecimal v){this.total=v;}
    public String getDetalle(){return detalle;} public void setDetalle(String v){this.detalle=v;}
    public String getComprador(){return comprador;} public void setComprador(String v){this.comprador=v;}
    public String getComprobante(){return comprobante;} public void setComprobante(String v){this.comprobante=v;}
    public String getEstado(){return estado;} public void setEstado(String v){this.estado=v;}
}
