import { MigrationInterface, QueryRunner } from "typeorm";

export class New1754237511150 implements MigrationInterface {
    name = 'New1754237511150'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ngo_pre_register_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "website" character varying, "city" integer NOT NULL, "state" integer NOT NULL, "country" integer NOT NULL, "postalAddress" character varying NOT NULL, "emailAddress" character varying NOT NULL, "phoneNumber" integer NOT NULL, "swPhoneNumber" integer NOT NULL, "logoUrl" character varying, "docUrl" character varying NOT NULL, "idCardUrl" character varying NOT NULL, CONSTRAINT "PK_05ee6985c378dd47cb7abde3f3d" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "ngo_pre_register_entity"`);
    }

}
