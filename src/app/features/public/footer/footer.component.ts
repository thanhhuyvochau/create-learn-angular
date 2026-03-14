import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  template: `
    <footer class="footer">
      <div class="footer-container">
        <!-- Brand Section -->
        <div class="footer-brand">
          <img src="/images/algocore-logo.jpg" alt="AlgoCore Education" class="footer-logo" />
          <h3 class="footer-title">AlgoCore Education</h3>
          <p class="footer-description">
            Đồng hành cùng học sinh IGCSE, AS/A Level, IB và AP chinh phục 
            chương trình quốc tế với phương pháp giảng dạy hiệu quả.
          </p>
        </div>

        <!-- Programs Column -->
        <div class="footer-column">
          <h4 class="column-title">Chương trình</h4>
          <ul class="footer-links">
            <li><a routerLink="/class/subject/1">IGCSE</a></li>
            <li><a routerLink="/class/subject/2">AS/A Level</a></li>
            <li><a routerLink="/class/subject/3">IB Diploma</a></li>
            <li><a routerLink="/class/subject/4">AP</a></li>
          </ul>
        </div>

        <!-- About Column -->
        <div class="footer-column">
          <h4 class="column-title">Về AlgoCore</h4>
          <ul class="footer-links">
            <li><a routerLink="/about">Giới thiệu</a></li>
            <li><a routerLink="/teachers">Đội ngũ giáo viên</a></li>
            <li><a routerLink="/news">Blog học thuật</a></li>
            <li><a routerLink="/recruitment">Tuyển dụng</a></li>
          </ul>
        </div>

        <!-- Contact Column -->
        <div class="footer-column">
          <h4 class="column-title">Liên hệ</h4>
          <ul class="contact-info">
            <li>
              <mat-icon>location_on</mat-icon>
              <span>123 Nguyen Hue, Quan 1, TP. Ho Chi Minh</span>
            </li>
            <li>
              <mat-icon>phone</mat-icon>
              <span>+84 (28) 1234 5678</span>
            </li>
            <li>
              <mat-icon>email</mat-icon>
              <span>info&#64;algocore.edu.vn</span>
            </li>
          </ul>
          <div class="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Facebook">
              <mat-icon>facebook</mat-icon>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener" aria-label="YouTube">
              <mat-icon>smart_display</mat-icon>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener" aria-label="LinkedIn">
              <mat-icon>work</mat-icon>
            </a>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="footer-bottom">
        <div class="footer-bottom-container">
          <p class="copyright">
            &copy; {{ currentYear }} AlgoCore Education. Đã đăng ký bản quyền.
          </p>
          <div class="legal-links">
            <a routerLink="/privacy">Chính sách bảo mật</a>
            <span class="divider">|</span>
            <a routerLink="/terms">Điều khoản sử dụng</a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: linear-gradient(135deg, #1a365d 0%, #0f172a 100%);
      color: white;
    }

    .footer-container {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.5fr;
      gap: 48px;
      max-width: 1400px;
      margin: 0 auto;
      padding: 64px 24px;
    }

    .footer-brand {
      max-width: 320px;
    }

    .footer-logo {
      height: 60px;
      width: auto;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .footer-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 0 16px 0;
    }

    .footer-description {
      font-size: 0.875rem;
      line-height: 1.6;
      color: #94a3b8;
      margin: 0;
    }

    .footer-column {
      display: flex;
      flex-direction: column;
    }

    .column-title {
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 20px 0;
      color: white;
    }

    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-links li {
      margin-bottom: 12px;
    }

    .footer-links a {
      color: #94a3b8;
      text-decoration: none;
      font-size: 0.875rem;
      transition: color 0.2s;
    }

    .footer-links a:hover {
      color: #60a5fa;
    }

    .contact-info {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .contact-info li {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 16px;
      color: #94a3b8;
      font-size: 0.875rem;
    }

    .contact-info mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #60a5fa;
      flex-shrink: 0;
    }

    .social-links {
      display: flex;
      gap: 16px;
      margin-top: 20px;
    }

    .social-links a {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      transition: background 0.2s;
    }

    .social-links a:hover {
      background: #2563eb;
    }

    .footer-bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.2);
    }

    .footer-bottom-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px 24px;
    }

    .copyright {
      margin: 0;
      font-size: 0.875rem;
      color: #64748b;
    }

    .legal-links {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .legal-links a {
      color: #64748b;
      text-decoration: none;
      font-size: 0.875rem;
      transition: color 0.2s;
    }

    .legal-links a:hover {
      color: white;
    }

    .legal-links .divider {
      color: #475569;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .footer-container {
        grid-template-columns: 1fr 1fr;
        gap: 40px;
      }

      .footer-brand {
        grid-column: span 2;
        max-width: none;
      }
    }

    @media (max-width: 600px) {
      .footer-container {
        grid-template-columns: 1fr;
        gap: 32px;
        padding: 40px 16px;
      }

      .footer-brand {
        grid-column: span 1;
      }

      .footer-bottom-container {
        flex-direction: column;
        gap: 12px;
        text-align: center;
      }
    }
  `],
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
