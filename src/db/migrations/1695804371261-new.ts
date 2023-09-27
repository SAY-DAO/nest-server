import { MigrationInterface, QueryRunner } from "typeorm";

export class New1695804371261 implements MigrationInterface {
    name = 'New1695804371261'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "variable_entity" ADD "needId" uuid`);
        await queryRunner.query(`ALTER TABLE "variable_entity" ADD CONSTRAINT "FK_9f8938f6f44467862a0175234b0" FOREIGN KEY ("needId") REFERENCES "need_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "variable_entity" DROP CONSTRAINT "FK_9f8938f6f44467862a0175234b0"`);
        await queryRunner.query(`ALTER TABLE "variable_entity" DROP COLUMN "needId"`);
    }

}
