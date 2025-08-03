package dtos;

public class ResumenMensualDTO {
    private int ingresos;
    private int egresos;
    private int balance;

    public ResumenMensualDTO(int ingresos, int egresos) {
        this.ingresos = ingresos;
        this.egresos = egresos;
        this.balance = ingresos - egresos;
    }

    public int getIngresos() {
        return ingresos;
    }

    public int getEgresos() {
        return egresos;
    }

    public int getBalance() {
        return balance;
    }
}
