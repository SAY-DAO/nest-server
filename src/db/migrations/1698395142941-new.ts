import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1698395142941 implements MigrationInterface {
  name = 'New1698395142941';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "children_pre_register_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "awakeUrl" character varying NOT NULL, "sleptUrl" character varying NOT NULL, "sayName" hstore NOT NULL, "firstName" hstore, "lastName" hstore, "bio" character varying, "birthDate" TIMESTAMP WITH TIME ZONE, "birthPlace" integer, "city" integer, "state" integer, "country" integer, "sex" integer, "education" integer, "housingStatus" integer, "flaskSwId" integer, "address" character varying, "familyCount" integer, "phoneNumber" character varying, "flaskNgoId" integer, "voiceUrl" character varying, "isApproved" boolean DEFAULT false, "locationId" uuid, CONSTRAINT "PK_a06984f3a83b097b1dc2c8bf2a0" PRIMARY KEY ("id"))`,
    );
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "children_pre_register_entity" DROP CONSTRAINT "FK_2b2ec4ae41b2b9a3c6a48054d45"`,
    );
  }
}
