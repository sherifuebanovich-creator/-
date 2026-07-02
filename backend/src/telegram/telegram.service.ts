import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly botToken: string;
  private readonly chatId: string;

  constructor(private config: ConfigService) {
    this.botToken = this.config.get('TELEGRAM_BOT_TOKEN', '');
    this.chatId = this.config.get('TELEGRAM_CHAT_ID', '');
  }

  async sendReportNotification(report: {
    type: string;
    description?: string;
    lat: number;
    lng: number;
    severity: number;
    images?: string[];
    address?: string;
    userDisplayName?: string;
  }) {
    if (!this.botToken || !this.chatId) {
      this.logger.warn('Telegram not configured, skipping notification');
      return;
    }

    const severityEmoji = report.severity >= 4 ? '🔴' : report.severity >= 3 ? '🟡' : '🟢';
    const mapLink = `https://www.google.com/maps?q=${report.lat},${report.lng}`;

    let text = `${severityEmoji} <b>НОВЫЙ РЕПОРТ</b>\n`;
    text += `<b>Тип:</b> ${report.type}\n`;
    text += `<b>Серьёзность:</b> ${report.severity}/5\n`;
    if (report.address) text += `<b>Адрес:</b> ${report.address}\n`;
    if (report.description) text += `<b>Описание:</b> ${report.description}\n`;
    if (report.userDisplayName) text += `<b>От:</b> ${report.userDisplayName}\n`;
    text += `<b>Карта:</b> ${mapLink}`;

    try {
      if (report.images && report.images.length > 0) {
        await axios.post(`https://api.telegram.org/bot${this.botToken}/sendPhoto`, {
          chat_id: this.chatId,
          photo: report.images[0],
          caption: text,
          parse_mode: 'HTML',
        }, { timeout: 10000 });
      } else {
        await axios.post(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
          chat_id: this.chatId,
          text,
          parse_mode: 'HTML',
        }, { timeout: 10000 });
      }
      this.logger.log(`Report sent to Telegram: ${report.type}`);
    } catch (error) {
      this.logger.error('Failed to send Telegram notification', error instanceof Error ? error.message : String(error));
    }
  }
}
