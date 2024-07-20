import { MigrationInterface, QueryRunner } from "typeorm";

export class New1721228883744 implements MigrationInterface {
    name = 'New1721228883744'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "children_entity" ADD "schoolType" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "children_entity" DROP COLUMN "schoolType"`);
    }

}
