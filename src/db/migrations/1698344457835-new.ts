import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1698344457835 implements MigrationInterface {
  name = 'New1698344457835';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "children_pre_register_entity" DROP CONSTRAINT "FK_779dbfb6fb908ee9f9d3714e2cb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ngo_entity" DROP CONSTRAINT "FK_bbd381806e2ff04a8ff95f72a88"`,
    );
    await queryRunner.query(
      `ALTER TABLE "children_pre_register_entity" RENAME COLUMN "cityObjectId" TO "locationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ngo_entity" RENAME COLUMN "cityObjectId" TO "locationId"`,
    );
    await queryRunner.query(
      `CREATE TABLE "location_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "flaskCityId" integer NOT NULL, "name" character varying, "stateId" integer, "stateCode" character varying, "stateName" character varying, "countryId" integer, "countryCode" character varying, "countryName" character varying, "latitude" character varying, "longitude" character varying, CONSTRAINT "PK_9debf81cdf142d284fce9b8fd7b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "children_pre_register_entity" ADD CONSTRAINT "FK_2b2ec4ae41b2b9a3c6a48054d45" FOREIGN KEY ("locationId") REFERENCES "location_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ngo_entity" ADD CONSTRAINT "FK_6ec8a85276e7c6122fbd237210a" FOREIGN KEY ("locationId") REFERENCES "location_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ngo_entity" DROP CONSTRAINT "FK_6ec8a85276e7c6122fbd237210a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "children_pre_register_entity" DROP CONSTRAINT "FK_2b2ec4ae41b2b9a3c6a48054d45"`,
    );
    await queryRunner.query(`DROP TABLE "location_entity"`);
    await queryRunner.query(
      `ALTER TABLE "ngo_entity" RENAME COLUMN "locationId" TO "cityObjectId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "children_pre_register_entity" RENAME COLUMN "locationId" TO "cityObjectId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ngo_entity" ADD CONSTRAINT "FK_bbd381806e2ff04a8ff95f72a88" FOREIGN KEY ("cityObjectId") REFERENCES "city_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "children_pre_register_entity" ADD CONSTRAINT "FK_779dbfb6fb908ee9f9d3714e2cb" FOREIGN KEY ("cityObjectId") REFERENCES "city_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
