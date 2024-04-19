import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { UserService } from '../user/user.service';
import { NeedService } from './need.service';
import { isAuthenticated } from 'src/utils/auth';
import {
  AnnouncementEnum,
  CategoryEnum,
  Colors,
  FlaskUserTypesEnum,
  NeedTypeEnum,
  ProductStatusEnum,
  SAYPlatformRoles,
  SUPER_ADMIN_ID,
} from 'src/types/interfaces/interface';
import config from 'src/config';
import { daysDifference } from 'src/utils/helpers';
import axios from 'axios';
import { NgoService } from '../ngo/ngo.service';
import { format } from 'date-fns';
import { TicketService } from '../ticket/ticket.service';
import {
  checkNeed,
  GRACE_PERIOD,
  SIMILAR_NAME_LIMIT,
  validateNeed,
} from 'src/utils/needConfirm';
import { ValidatedDupType } from 'src/types/interfaces/Need';
import { SyncService } from '../sync/sync.service';
import { TicketEntity } from 'src/entities/ticket.entity';

const BASE_LIMIT_DUPLICATES_0 = 4; // when confirming a need 4 duplicates are allowed for the category 0
const BASE_LIMIT_DUPLICATES_1 = 3;
const BASE_LIMIT_DUPLICATES_2 = 5;
const BASE_LIMIT_DUPLICATES_3 = 2;

@ApiTags('Needs')
@ApiSecurity('flask-access-token')
@ApiHeader({
  name: 'flaskId',
  description: 'to use cache and flask authentication',
  required: true,
})
@Controller('needs')
export class NeedController {
  constructor(
    private needService: NeedService,
    private userService: UserService,
    private ngoService: NgoService,
    private ticketService: TicketService,
    private syncService: SyncService,
  ) {}

  @Get(`all`)
  @ApiOperation({ description: 'Get all needs from db 1' })
  async getNeeds(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    return await this.needService.getNeeds();
  }

  @Get(`:needId`)
  @ApiOperation({ description: 'Get one need' })
  async getANeed(@Req() req: Request, @Param('needId') needId: string) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    return await this.needService.getNeedById(needId);
  }

  @Get(`flask/random`)
  @ApiOperation({ description: 'Get a random need from flask' })
  async getRandomNeed(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    return await this.needService.getFlaskRandomNeed();
  }

  @Get(`flask/arriving/:code`)
  @ApiOperation({ description: 'Get all done needs from flask' })
  async getFlaskNeedsByDeliveryCode(
    @Req() req: Request,
    @Param('code') code: string,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(401, 'You Are not authorized!');
    }
    return await this.needService.getFlaskNeedsByDeliveryCode(code);
  }

  @Get(`flask/auditedBy/:flaskUserId`)
  @ApiOperation({ description: 'Get all done needs from flask' })
  async getFlaskAuditorNeeds(
    @Req() req: Request,
    @Param('flaskUserId') flaskUserId: number,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(401, 'You Are not authorized!');
    }
    return await this.needService.getFlaskAuditorNeeds(flaskUserId);
  }

  @Get(`nest/auditedBy/:flaskUserId`)
  @ApiOperation({ description: 'Get all done needs from nest' })
  async getNestAuditorNeeds(
    @Req() req: Request,
    @Param('flaskUserId') flaskUserId: number,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(401, 'You Are not authorized!');
    }
    return await this.needService.getNestAuditorNeeds(flaskUserId);
  }

  @Get(`nest/purchasedBy/:flaskUserId`)
  @ApiOperation({ description: 'Get all done needs from nest' })
  async getNestPurchaserNeeds(
    @Req() req: Request,
    @Param('flaskUserId') flaskUserId: number,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(401, 'You Are not authorized!');
    }
    return await this.needService.getNestPurchaserNeeds(flaskUserId);
  }

  @Get(`flask/:id`)
  @ApiOperation({ description: 'Get a need from db 2' })
  async getFlaskNeed(@Req() req: Request, @Param('id') id: number) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(401, 'You Are not authorized!');
    }
    return await this.needService.getFlaskNeed(id);
  }

  @Get(`one/:needFlaskId`)
  @ApiOperation({ description: 'Get a need from db 2' })
  async getNeedByFlaskId(
    @Req() req: Request,
    @Param('needFlaskId') needFlaskId: number,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(401, 'You Are not authorized!');
    }
    return await this.needService.getNeedByFlaskId(needFlaskId);
  }

  @Get('flask/preneeds/templates')
  @ApiOperation({ description: 'Get all done needs from flask' })
  async getPrNeed(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(401, 'You Are not authorized!');
    }
    const token =
      config().dataCache.fetchPanelAuthentication(panelFlaskUserId).token;
    const preNeeds = await this.needService.getFlaskPreNeed(token);

    return preNeeds;
  }

  @Get(`unconfirmed/:swId`)
  @ApiOperation({ description: 'Get all done needs from flask' })
  async getNotConfirmedNeeds(
    @Req() req: Request,
    @Param('swId') socialWorkerId: number,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];

    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(401, 'You Are not authorized!');
    }

    const socialWorker = await this.userService.getFlaskSocialWorker(
      socialWorkerId,
    ); // sw ngo
    const unconfirmedCount = await this.needService.getNotConfirmedNeeds(
      socialWorkerId,
      null,
      [socialWorker.ngo_id],
    );
    return unconfirmedCount[1];
  }

  @Post(`confirm/mass`)
  @ApiOperation({ description: 'Confirm array of needs' })
  async massConfirmNeeds(
    @Req() req: Request,
    @Body() body: { needIds: number[] },
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];

    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(401, 'You Are not authorized!');
    }

    const token =
      config().dataCache.fetchPanelAuthentication(panelFlaskUserId).token;
    if (body) {
      for (const needId of body.needIds) {
        const configs = {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: token,
            processData: false,
            contentType: false,
          },
        };
        // create flask child
        const { data } = await axios.patch(
          `https://api.sayapp.company/api/v2/need/confirm/needId=${needId}`,
          {},
          configs,
        );
      }
    }
  }

  @Get(`confirm/prepare`)
  @ApiOperation({ description: 'Prepare confirm needs' })
  async prepareConfirmNeeds(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];

    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(401, 'You Are not authorized!');
    }

    // 0- Fetch only active SW + NGO
    const swIds = await this.userService
      .getFlaskSwIds()
      .then((r) => r.filter((s) => s.is_active).map((s) => s.id));

    const ngoIds = await this.ngoService
      .getFlaskNgos()
      .then((r) => r.filter((n) => n.isActive).map((n) => n.id));
    const notConfirmed = await this.needService.getNotConfirmedNeeds(
      null,
      swIds,
      ngoIds,
    );
    let toBeConfirmed = config().dataCache.fetchToBeConfirmed();
    if (
      !toBeConfirmed ||
      !toBeConfirmed[0] ||
      toBeConfirmed.length !== notConfirmed[1]
    ) {
      for await (const need of notConfirmed[0]) {
        console.log(`Mass Confirm preparation: ${need.id}`);
        // 1- sync & validate need
        const { need: nestNeed } = await this.syncService.syncNeed(
          need,
          need.child_id,
          panelFlaskUserId,
          null,
          null,
          null,
        );

        const superAdmin = await this.userService.getUserByFlaskId(
          SUPER_ADMIN_ID,
        );

        const validatedNeed = await validateNeed(nestNeed, superAdmin);
        let ticket: TicketEntity;

        // 0-  ticket if not a valid need and not ticketed yet
        if (!validatedNeed.isValidNeed) {
          const needTickets = await this.ticketService.getTicketsByNeed(
            validatedNeed.needId,
          );
          const ticketError = needTickets.find(
            (t) => t.lastAnnouncement === AnnouncementEnum.ERROR,
          );
          // create ticket if already has not
          if (!ticketError) {
            console.log('\x1b[36m%s\x1b[0m', 'Creating Ticket Content ...\n');
            ticket = await this.ticketService.createTicket(
              validatedNeed.ticketDetails,
              validatedNeed.participants,
            );
            await this.ticketService.createTicketContent(
              {
                message: validatedNeed.message,
                from: superAdmin.flaskUserId,
                announcement: validatedNeed.ticketDetails.lastAnnouncement,
              },
              ticket,
            );
            await this.ticketService.createTicketView(
              superAdmin.flaskUserId,
              ticket.id,
            );
          } else if (
            ticketError &&
            daysDifference(ticketError.createdAt, new Date()) > GRACE_PERIOD
          ) {
            console.log('\x1b[36m%s\x1b[0m', 'Deleting need...\n');
            //delete
          }
          toBeConfirmed.push({
            limit: null,
            validCount: null,
            need,
            duplicates: null,
            errorMsg: validatedNeed.message,
          });
          console.log('\x1b[36m%s\x1b[0m', 'Skipping need...\n');
          continue;
        }
        /// -------------------------------- If Valid Need --------------------------------------------///
        // 1- get duplicates for the child / same name-translations.en
        const duplicates = await this.needService.getDuplicateNeeds(
          need.child_id,
          need.id,
        );

        let validatedDups: ValidatedDupType[];
        if (duplicates && duplicates[0]) {
          validatedDups = duplicates.map((d) => {
            return {
              ...d,
              validation: checkNeed(need, d),
            };
          });
        }

        let errorMsg: string;
        // 2- compare to confirmed similar needs / names_translations
        // then if not many similar needs it should be checked manually
        const similarNameNeeds = await this.needService.getSimilarNeeds(
          need.name_translations.en,
        );
        const filtered = similarNameNeeds.filter(
          (n) => n.category === need.category,
        );
        if (filtered.length < SIMILAR_NAME_LIMIT) {
          errorMsg = `Similar count error, only ${filtered.length}.`;
        }

        // 3- if we have a milk for sara, only two more needs from the same category. eg: cheese, butter,...
        // every category different limit
        let limit: number;
        if (need.category === CategoryEnum.GROWTH) {
          limit = BASE_LIMIT_DUPLICATES_0;
        }
        if (need.category === CategoryEnum.JOY) {
          limit = BASE_LIMIT_DUPLICATES_1;
        }
        if (need.category === CategoryEnum.HEALTH) {
          limit = BASE_LIMIT_DUPLICATES_2;
        }
        if (need.category === CategoryEnum.SURROUNDING) {
          limit = BASE_LIMIT_DUPLICATES_3;
        }
        const validCount =
          validatedDups &&
          validatedDups.filter((v) => v.validation.isValidDuplicate).length;

        if (validCount && limit < validCount) {
          errorMsg = `Limit error, ${limit}`;
        }
        if (
          validatedDups &&
          validatedDups.filter((v) => v.category !== nestNeed.category).length >
            0
        ) {
          errorMsg = `Category error, ${
            validatedDups.filter((v) => v.category !== nestNeed.category).length
          }`;
        }
        toBeConfirmed.push({
          limit,
          validCount,
          need,
          duplicates: validatedDups,
          errorMsg,
        });
      }

      config().dataCache.storeToBeConfirmed(toBeConfirmed);
    }
    toBeConfirmed = config().dataCache.fetchToBeConfirmed();

    return toBeConfirmed;
  }

  @Get('duplicates/:flaskChildId/:flaskNeedId')
  @ApiOperation({ description: 'Get duplicates need for confirming' })
  async getDuplicateNeeds(
    @Req() req: Request,
    @Param('flaskChildId') flaskChildId: number,
    @Param('flaskNeedId') flaskNeedId: number,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(401, 'You Are not authorized!');
    }

    return await this.needService.getDuplicateNeeds(flaskChildId, flaskNeedId);
  }

  @Get('delete/candidates')
  @ApiOperation({ description: 'Get old needs to delete if not paid.' })
  async deleteCandidates(@Req() req: Request) {
    // delete old confirmed needs
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN ||
      panelFlaskUserId !== SUPER_ADMIN_ID
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    const deleteCandidates = await this.needService.getDeleteCandidates();

    return { list: deleteCandidates[0], total: deleteCandidates[1] };
  }

  @Get('update/candidates')
  @ApiOperation({ description: 'Get arrived needs to update them' })
  async updateArrivalsCandidates(@Req() req: Request) {
    // delete old confirmed needs
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN ||
      panelFlaskUserId !== SUPER_ADMIN_ID
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    const updateCandidates =
      await this.needService.getArrivalUpdateCandidates();

    return { list: updateCandidates[0], total: updateCandidates[1] };
  }

  @Get('delete/old')
  @ApiOperation({ description: 'Get duplicates need for confirming' })
  async deleteOldNeeds(@Req() req: Request) {
    // delete old confirmed needs
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN ||
      panelFlaskUserId !== SUPER_ADMIN_ID
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    const deleteCandidates = await this.needService.getDeleteCandidates();
    for await (const need of deleteCandidates[0]) {
      const daysDiff = daysDifference(need.confirmDate, new Date());
      if (daysDiff > 90) {
        const accessToken =
          config().dataCache.fetchPanelAuthentication(panelFlaskUserId).token;
        await this.needService.deleteFlaskOneNeed(need.id, accessToken);
      }
    }
    return { deleted: deleteCandidates[1] };
  }

  @Get('update/arrivals')
  async updateNeedsStatus(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN ||
      panelFlaskUserId !== SUPER_ADMIN_ID
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }

    const needs = await this.needService.getArrivalUpdateCandidates();

    const token =
      config().dataCache.fetchPanelAuthentication(panelFlaskUserId).token;

    const configs = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: token,
        processData: false,
        contentType: false,
      },
    };

    for await (const need of needs[0]) {
      if (
        need.type === NeedTypeEnum.PRODUCT &&
        need.status === ProductStatusEnum.PURCHASED_PRODUCT
      ) {
        const ticket = await this.ticketService.getTicketByFlaskNeedId(need.id);

        try {
          if (
            ticket &&
            ticket.ticketHistories &&
            ticket.ticketHistories.find(
              (h) => h.announcement == AnnouncementEnum.ARRIVED_AT_NGO,
            )
          ) {
            const formData = new FormData();
            formData.append('status', String(4));
            formData.append(
              'ngo_delivery_date',
              String(
                format(
                  new Date(
                    ticket.ticketHistories.find(
                      (h) => h.announcement == AnnouncementEnum.ARRIVED_AT_NGO,
                    ).announcedArrivalDate,
                  ),
                  'yyyy-MM-dd',
                ),
              ),
            );

            const { data } = await axios.patch(
              `https://api.sayapp.company/api/v2/need/update/needId=${need.id}`,
              {
                status: ProductStatusEnum.DELIVERED_TO_NGO,
                ngo_delivery_date: String(
                  format(
                    new Date(
                      ticket.ticketHistories.find(
                        (h) =>
                          h.announcement == AnnouncementEnum.ARRIVED_AT_NGO,
                      ).announcedArrivalDate,
                    ),
                    'yyyy-MM-dd',
                  ),
                ),
              },
              configs,
            );

            if (data.status === ProductStatusEnum.DELIVERED_TO_NGO) {
              await this.ticketService.updateTicketColor(
                ticket.id,
                Colors.BLUE,
              );
            }
          }
        } catch (e) {
          console.log(e);
        }
      }
    }
  }
}
