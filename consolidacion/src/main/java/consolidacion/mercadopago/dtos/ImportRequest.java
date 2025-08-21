package consolidacion.mercadopago.dtos;

public class ImportRequest {
    private Long paymentId;
    private Integer month;
    private Integer year;
    public Long getPaymentId(){return paymentId;} public void setPaymentId(Long v){this.paymentId=v;}
    public Integer getMonth(){return month;} public void setMonth(Integer v){this.month=v;}
    public Integer getYear(){return year;} public void setYear(Integer v){this.year=v;}
}
