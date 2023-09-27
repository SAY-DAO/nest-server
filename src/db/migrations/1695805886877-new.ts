import { MigrationInterface, QueryRunner } from "typeorm";

export class New1695805886877 implements MigrationInterface {
    name = 'New1695805886877'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "variable_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "flaskUserId" integer NOT NULL, "distanceRatio" integer NOT NULL, "difficultyRatio" integer NOT NULL, "contributionRatio" integer NOT NULL, "needFlaskId" integer NOT NULL, "needId" uuid, CONSTRAINT "PK_2b518bfd4b9aea8ca0515777e96" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "variable_entity" ADD CONSTRAINT "FK_9f8938f6f44467862a0175234b0" FOREIGN KEY ("needId") REFERENCES "need_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "variable_entity" DROP CONSTRAINT "FK_9f8938f6f44467862a0175234b0"`);
        await queryRunner.query(`DROP TABLE "variable_entity"`);
    }

}
