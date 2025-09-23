package notificacion;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class NotificacionApplication {

	public static void main(String[] args) {
		SpringApplication.run(NotificacionApplication.class, args);
	}

}
