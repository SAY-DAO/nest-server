import { MigrationInterface, QueryRunner } from "typeorm";

export class New1721227837097 implements MigrationInterface {
    name = 'New1721227837097'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "children_entity" ADD "familyCount" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "children_entity" DROP COLUMN "familyCount"`);
    }

}
