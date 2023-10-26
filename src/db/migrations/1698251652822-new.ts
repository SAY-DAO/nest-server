import { MigrationInterface, QueryRunner } from "typeorm";

export class New1698251652822 implements MigrationInterface {
    name = 'New1698251652822'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "children_pre_register_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "awakeUrl" character varying NOT NULL, "sleptUrl" character varying NOT NULL, "sayName" hstore NOT NULL, "bioTranslations" character varying, "birthDate" TIMESTAMP WITH TIME ZONE, "birthPlace" integer, "city" integer, "country" integer, "sex" integer, "education" integer, "housingStatus" integer, "flaskSwId" integer, "address" character varying, "phoneNumber" character varying, "flaskNgoId" integer, "voiceUrl" character varying, CONSTRAINT "PK_a06984f3a83b097b1dc2c8bf2a0" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "children_pre_register_entity"`);
    }

}
