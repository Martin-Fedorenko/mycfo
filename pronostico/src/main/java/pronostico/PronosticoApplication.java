package pronostico;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PronosticoApplication {

	public static void main(String[] args) {
		SpringApplication.run(PronosticoApplication.class, args);
	}

}
