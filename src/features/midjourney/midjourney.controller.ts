import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MidjourneyService } from './midjourney.service';
import { CreateMidjourneyDto } from './dto/create-midjourney.dto';
import { UpdateMidjourneyDto } from './dto/update-midjourney.dto';
import { WalletService } from '../wallet/wallet.service';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import fs from 'fs';
import config from 'src/config';
import { checkIfFileOrDirectoryExists, deleteFile } from 'src/utils/file';

@ApiTags('Midjourney')
@ApiSecurity('flask-access-token')
@ApiHeader({
  name: 'flaskSwId',
  description: 'to use cache and flask authentication',
  required: true,
})
@Controller('midjourney')
export class MidjourneyController {
  constructor(
    private readonly midjourneyService: MidjourneyService,
    private readonly walletService: WalletService,
  ) {}

  @Post()
  create(@Body() createMidjourneyDto: CreateMidjourneyDto) {
    return this.midjourneyService.create(createMidjourneyDto);
  }

  @Get()
  @ApiOperation({ description: 'Get all signed' })
  async findAll() {
    const needWithSignatures =
      await this.walletService.getAllFamilyReadyToSignNeeds();
    const list = [];
    const listOfIds = [];
    needWithSignatures.forEach((n) => {
      if (!listOfIds.find((i) => i === n.id)) {
        const data = {
          id: n.id,
          flaskId: n.flaskId,
          link: n.needRetailerImg,
          prompt:
            'only one ' +
            n.nameTranslations.en +
            ', with white background, drawn in manga style, borderless stickers, no graininess, vector, minimal style',
        };
        list.push(data);
        listOfIds.push(n.id);
      } else {
        console.log(listOfIds);
      }
    });
    config().dataCache.storeMidjourny(list);
    if (checkIfFileOrDirectoryExists('midJourney.json')) {
      deleteFile('midJourney.json');
    }
    fs.appendFile(
      'midJourney.json',
      JSON.stringify(config().dataCache.fetchMidjourney()),
      function (err) {
        if (err) {
          // append failed
        } else {
          // done
        }
      },
    );
    return list;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.midjourneyService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMidjourneyDto: UpdateMidjourneyDto,
  ) {
    return this.midjourneyService.update(+id, updateMidjourneyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.midjourneyService.remove(+id);
  }
}
