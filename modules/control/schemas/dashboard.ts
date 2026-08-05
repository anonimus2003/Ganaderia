import { Animal } from "./animal";
import { Produccion } from "./produccion";
import { Metrica } from "./metrica";

export interface Dashboard {

    animal: Animal;

    metricas: Metrica[];

    produccion: Produccion[];

}