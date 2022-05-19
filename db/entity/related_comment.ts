import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinColumn, JoinTable } from 'typeorm';
import { User } from './user'
import { Comment } from './comment'

@Entity({name: 'related_comments'})
export class RelatedComment extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id!: number;

  @Column()
  content!: string;

  @Column()
  create_time!: Date;

  @Column()
  update_time!: Date;

  @Column()
  rank!: number;

  @Column()
  is_delete!: boolean;

  @Column()
  like_counts!: number;

  @ManyToMany(() => User, {
    cascade: true
  })
  @JoinTable({
    name: 'related_comments_likes_rel',
    joinColumn: {
      name: 'related_comment_id'
    },
    inverseJoinColumn: {
      name: 'user_id'
    }
  })
  like_users!: User[]

  @ManyToOne(() => User)
  @JoinColumn({name: 'user_id'})
  user!: User;

  @ManyToOne(() => User)
  @JoinColumn({name: 'rel_user_id'})
  rel_user!: User;

  @ManyToOne(() => Comment)
  @JoinColumn({name: 'rel_comment_id'})
  rel_comment!: Comment;
}